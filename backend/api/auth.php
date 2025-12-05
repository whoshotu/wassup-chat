<?php
/**
 * Authentication API Endpoints
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../utils/jwt.php';

$database = new Database();
$db = $database->getConnection();

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// Parse request
$data = json_decode(file_get_contents("php://input"), true);

// Route handling
if ($method === 'POST' && strpos($request_uri, '/signup') !== false) {
    signup($db, $data);
} elseif ($method === 'POST' && strpos($request_uri, '/login') !== false) {
    login($db, $data);
} elseif ($method === 'POST' && strpos($request_uri, '/logout') !== false) {
    logout($db);
} elseif ($method === 'GET' && strpos($request_uri, '/me') !== false) {
    getCurrentUser($db);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

function signup($db, $data) {
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid email format']);
        return;
    }

    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        return;
    }

    // Check if user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'User already exists']);
        return;
    }

    // Create user
    $user_id = generateUUID();
    $password_hash = password_hash($password, PASSWORD_BCRYPT);
    
    $stmt = $db->prepare("INSERT INTO users (id, email, password_hash, viewer_countries) VALUES (?, ?, ?, ?)");
    $stmt->execute([$user_id, $email, $password_hash, json_encode([])]);

    // Create free subscription
    $stmt = $db->prepare("INSERT INTO subscriptions (user_id, plan_type, status) VALUES (?, 'free', 'active')");
    $stmt->execute([$user_id]);

    // Generate JWT token
    $token = generateJWT($user_id, $email);

    http_response_code(201);
    echo json_encode([
        'user' => [
            'id' => $user_id,
            'email' => $email,
            'primaryLanguage' => 'English',
            'viewerCountries' => []
        ],
        'token' => $token
    ]);
}

function login($db, $data) {
    if (!isset($data['email']) || !isset($data['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Email and password are required']);
        return;
    }

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    $password = $data['password'];

    $stmt = $db->prepare("SELECT id, email, password_hash, primary_language, viewer_countries FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
        return;
    }

    // Generate JWT token
    $token = generateJWT($user['id'], $user['email']);

    http_response_code(200);
    echo json_encode([
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'primaryLanguage' => $user['primary_language'],
            'viewerCountries' => json_decode($user['viewer_countries'])
        ],
        'token' => $token
    ]);
}

function logout($db) {
    $token = getBearerToken();
    if ($token) {
        $token_hash = hash('sha256', $token);
        $stmt = $db->prepare("DELETE FROM sessions WHERE token_hash = ?");
        $stmt->execute([$token_hash]);
    }

    http_response_code(200);
    echo json_encode(['message' => 'Logged out successfully']);
}

function getCurrentUser($db) {
    $user_id = authenticateRequest($db);
    if (!$user_id) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    $stmt = $db->prepare("SELECT id, email, primary_language, viewer_countries FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
        return;
    }

    http_response_code(200);
    echo json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'primaryLanguage' => $user['primary_language'],
        'viewerCountries' => json_decode($user['viewer_countries'])
    ]);
}

function generateUUID() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
