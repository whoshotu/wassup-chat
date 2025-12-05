<?php
/**
 * JWT Token Utilities
 */

function generateJWT($user_id, $email) {
    $secret_key = getenv('JWT_SECRET') ?: 'your-secret-key-change-this';
    $issued_at = time();
    $expiration_time = $issued_at + (60 * 60 * 24 * 7); // 7 days

    $payload = [
        'iat' => $issued_at,
        'exp' => $expiration_time,
        'user_id' => $user_id,
        'email' => $email
    ];

    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);

    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret_key, true);
    $base64UrlSignature = base64UrlEncode($signature);

    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verifyJWT($token) {
    $secret_key = getenv('JWT_SECRET') ?: 'your-secret-key-change-this';
    
    $tokenParts = explode('.', $token);
    if (count($tokenParts) !== 3) {
        return false;
    }

    $header = base64_decode($tokenParts[0]);
    $payload = base64_decode($tokenParts[1]);
    $signatureProvided = $tokenParts[2];

    $base64UrlHeader = base64UrlEncode($header);
    $base64UrlPayload = base64UrlEncode($payload);
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret_key, true);
    $base64UrlSignature = base64UrlEncode($signature);

    if ($base64UrlSignature !== $signatureProvided) {
        return false;
    }

    $payload = json_decode($payload, true);
    
    if ($payload['exp'] < time()) {
        return false;
    }

    return $payload;
}

function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function getBearerToken() {
    $headers = getAuthorizationHeader();
    if (!empty($headers)) {
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            return $matches[1];
        }
    }
    return null;
}

function getAuthorizationHeader() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) {
        $headers = trim($_SERVER["Authorization"]);
    } elseif (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    } elseif (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $headers = trim($requestHeaders['Authorization']);
        }
    }
    return $headers;
}

function authenticateRequest($db) {
    $token = getBearerToken();
    if (!$token) {
        return false;
    }

    $payload = verifyJWT($token);
    if (!$payload) {
        return false;
    }

    return $payload['user_id'];
}
