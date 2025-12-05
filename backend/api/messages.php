<?php
/**
 * Messages API Endpoints
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, PUT, OPTIONS");
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

// Authenticate user
$user_id = authenticateRequest($db);
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Route handling
if ($method === 'GET' && strpos($request_uri, '/messages') !== false) {
    if (strpos($request_uri, '/favorites') !== false) {
        getFavorites($db, $user_id);
    } elseif (strpos($request_uri, '/search') !== false) {
        searchMessages($db, $user_id, $_GET['q'] ?? '');
    } else {
        getAllMessages($db, $user_id);
    }
} elseif ($method === 'POST' && strpos($request_uri, '/messages') !== false) {
    addMessage($db, $user_id, $data);
} elseif ($method === 'PUT' && preg_match('/\/messages\/([^\/]+)\/favorite/', $request_uri, $matches)) {
    toggleFavorite($db, $user_id, $matches[1]);
} elseif ($method === 'DELETE' && preg_match('/\/messages\/([^\/]+)/', $request_uri, $matches)) {
    deleteMessage($db, $user_id, $matches[1]);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}

function getAllMessages($db, $user_id) {
    $stmt = $db->prepare("
        SELECT id, original_text, detected_language, detected_region, 
               plain_explanation, slang_items, tone_tags, favorited, timestamp
        FROM decoded_messages 
        WHERE user_id = ? 
        ORDER BY timestamp DESC
    ");
    $stmt->execute([$user_id]);
    $messages = $stmt->fetchAll();

    foreach ($messages as &$message) {
        $message['slangItems'] = json_decode($message['slang_items']);
        $message['toneTags'] = json_decode($message['tone_tags']);
        unset($message['slang_items']);
        unset($message['tone_tags']);
    }

    http_response_code(200);
    echo json_encode($messages);
}

function addMessage($db, $user_id, $data) {
    if (!isset($data['originalText']) || !isset($data['detectedLanguage'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        return;
    }

    $message_id = generateUUID();
    
    $stmt = $db->prepare("
        INSERT INTO decoded_messages 
        (id, user_id, original_text, detected_language, detected_region, 
         plain_explanation, slang_items, tone_tags, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
    ");
    
    $stmt->execute([
        $message_id,
        $user_id,
        $data['originalText'],
        $data['detectedLanguage'],
        $data['detectedRegion'] ?? null,
        $data['plainExplanation'] ?? '',
        json_encode($data['slangItems'] ?? []),
        json_encode($data['toneTags'] ?? [])
    ]);

    // Update usage tracking
    $stmt = $db->prepare("
        INSERT INTO usage_tracking (user_id, decode_date, decode_count)
        VALUES (?, CURDATE(), 1)
        ON DUPLICATE KEY UPDATE decode_count = decode_count + 1
    ");
    $stmt->execute([$user_id]);

    http_response_code(201);
    echo json_encode([
        'id' => $message_id,
        'message' => 'Message saved successfully'
    ]);
}

function toggleFavorite($db, $user_id, $message_id) {
    $stmt = $db->prepare("
        UPDATE decoded_messages 
        SET favorited = NOT favorited 
        WHERE id = ? AND user_id = ?
    ");
    $stmt->execute([$message_id, $user_id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Message not found']);
        return;
    }

    http_response_code(200);
    echo json_encode(['message' => 'Favorite toggled successfully']);
}

function deleteMessage($db, $user_id, $message_id) {
    $stmt = $db->prepare("DELETE FROM decoded_messages WHERE id = ? AND user_id = ?");
    $stmt->execute([$message_id, $user_id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Message not found']);
        return;
    }

    http_response_code(200);
    echo json_encode(['message' => 'Message deleted successfully']);
}

function getFavorites($db, $user_id) {
    $stmt = $db->prepare("
        SELECT id, original_text, detected_language, detected_region, 
               plain_explanation, slang_items, tone_tags, favorited, timestamp
        FROM decoded_messages 
        WHERE user_id = ? AND favorited = 1
        ORDER BY timestamp DESC
    ");
    $stmt->execute([$user_id]);
    $messages = $stmt->fetchAll();

    foreach ($messages as &$message) {
        $message['slangItems'] = json_decode($message['slang_items']);
        $message['toneTags'] = json_decode($message['tone_tags']);
        unset($message['slang_items']);
        unset($message['tone_tags']);
    }

    http_response_code(200);
    echo json_encode($messages);
}

function searchMessages($db, $user_id, $query) {
    $stmt = $db->prepare("
        SELECT id, original_text, detected_language, detected_region, 
               plain_explanation, slang_items, tone_tags, favorited, timestamp
        FROM decoded_messages 
        WHERE user_id = ? AND (
            original_text LIKE ? OR 
            plain_explanation LIKE ? OR
            detected_language LIKE ?
        )
        ORDER BY timestamp DESC
    ");
    $search_term = "%{$query}%";
    $stmt->execute([$user_id, $search_term, $search_term, $search_term]);
    $messages = $stmt->fetchAll();

    foreach ($messages as &$message) {
        $message['slangItems'] = json_decode($message['slang_items']);
        $message['toneTags'] = json_decode($message['tone_tags']);
        unset($message['slang_items']);
        unset($message['tone_tags']);
    }

    http_response_code(200);
    echo json_encode($messages);
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
