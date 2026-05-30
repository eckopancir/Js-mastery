<?php
/**
 * CYBER ENGLISH - PHP BACKEND (PHP 5.6 compatibility edition)
 */
error_reporting(E_ALL);
ini_set('display_errors', 0); 

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

function sendError($msg, $code = 500) {
    http_response_code($code);
    echo json_encode(array("message" => $msg));
    exit;
}

// --- НАСТРОЙКИ БД ---
$db_host = 'localhost';
$db_user = 'r99546os_1';
$db_pass = 'LuGuYDIw3hyH';
$db_name = 'r99546os_1';

$conn = new mysqli($db_host, $db_user, $db_pass, $db_name);
if ($conn->connect_error) sendError("Database connection failed: " . $conn->connect_error);
$conn->set_charset("utf8mb4");

$secret = "cyber_english_super_secret_key_2026";

// --- ХЕЛПЕРЫ ---
function generateToken($userId, $secret) {
    $payload = base64_encode(json_encode(array('userId' => $userId, 'exp' => time() + 2592000)));
    $sig = hash_hmac('sha256', $payload, $secret);
    return $payload . '.' . $sig;
}

function verifyToken($token, $secret) {
    $parts = explode('.', $token);
    if (count($parts) != 2) return false;
    if (hash_hmac('sha256', $parts[0], $secret) !== $parts[1]) return false;
    $data = json_decode(base64_decode($parts[0]), true);
    if (!$data || !isset($data['exp']) || $data['exp'] < time()) return false;
    return $data['userId'];
}

function getBearerToken() {
    $headers = null;
    if (isset($_SERVER['Authorization'])) $headers = trim($_SERVER["Authorization"]);
    else if (isset($_SERVER['HTTP_AUTHORIZATION'])) $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
    else if (function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        if (isset($requestHeaders['Authorization'])) $headers = trim($requestHeaders['Authorization']);
    }
    if (!empty($headers) && preg_match('/Bearer\s(\S+)/', $headers, $matches)) return $matches[1];
    return null;
}

$input = json_decode(file_get_contents("php://input"), true);
$path = isset($_GET['path']) ? trim($_GET['path'], '/') : '';

$token = getBearerToken();
$userId = $token ? verifyToken($token, $secret) : null;

function authGuard($uid) {
    if (!$uid) sendError("Unauthorized", 401);
}

// --- РОУТИНГ ---
try {
    switch ($path) {
        case 'auth/register':
            if (empty($input['username']) || empty($input['password'])) sendError("Empty login/pass", 400);
            $user = $conn->real_escape_string($input['username']);
            $pass = password_hash($input['password'], PASSWORD_BCRYPT);
            
            $check = $conn->query("SELECT id FROM users WHERE username = '$user'");
            if ($check->num_rows > 0) sendError("User already exists", 400);
            
            if (!$conn->query("INSERT INTO users (username, password_hash) VALUES ('$user', '$pass')")) sendError($conn->error);
            $newId = $conn->insert_id;
            $conn->query("INSERT INTO user_settings (user_id) VALUES ($newId)");
            echo json_encode(array("message" => "Success"));
            break;

        case 'auth/login':
            $user = isset($input['username']) ? $conn->real_escape_string($input['username']) : '';
            $pass = isset($input['password']) ? $input['password'] : '';
            $res = $conn->query("SELECT * FROM users WHERE username = '$user'");
            if ($res->num_rows === 0) sendError("User not found", 401);
            
            $row = $res->fetch_assoc();
            if (password_verify($pass, $row['password_hash'])) {
                echo json_encode(array(
                    "token" => generateToken($row['id'], $secret),
                    "username" => $row['username']
                ));
            } else sendError("Wrong password", 401);
            break;

        case 'data/all':
            authGuard($userId);
            $words = array();
            $resW = $conn->query("SELECT * FROM user_words WHERE user_id = $userId");
            while($r = $resW->fetch_assoc()) $words[] = $r;
            
            $stats = array();
            $resS = $conn->query("SELECT * FROM word_stats WHERE user_id = $userId");
            while($r = $resS->fetch_assoc()) $stats[] = $r;
            
            $settings = $conn->query("SELECT * FROM user_settings WHERE user_id = $userId")->fetch_assoc();
            echo json_encode(array("words" => $words, "stats" => $stats, "settings" => $settings));
            break;

        case 'data/word/save':
            authGuard($userId);
            $w = $input;
            $word = $conn->real_escape_string($w['word']);
            $type = isset($w['type']) ? $conn->real_escape_string($w['type']) : '';
            $level = isset($w['level']) ? $conn->real_escape_string($w['level']) : '';
            $trans = isset($w['translation']) ? $conn->real_escape_string($w['translation']) : '';
            $phone = isset($w['phonetic']) ? $conn->real_escape_string($w['phonetic']) : '';
            $date = isset($w['learnedDate']) ? $conn->real_escape_string($w['learnedDate']) : '';
            $ts = isset($w['timestampAdded']) ? (float)$w['timestampAdded'] : 0;
            $isF = isset($w['is_finished']) ? (int)$w['is_finished'] : 0;
            $isM = isset($w['is_in_match']) ? (int)$w['is_in_match'] : 0;
            $eL = isset($w['eng_level']) ? (int)$w['eng_level'] : 1; 
            $eN = isset($w['eng_next_review']) ? (float)$w['eng_next_review'] : 0;
            $rL = isset($w['rus_level']) ? (int)$w['rus_level'] : 1; 
            $rN = isset($w['rus_next_review']) ? (float)$w['rus_next_review'] : 0;

            $sql = "INSERT INTO user_words (user_id, word, type, level, translation, phonetic, learned_date, timestamp_added, is_finished, is_in_match, eng_level, eng_next_review, rus_level, rus_next_review) 
                    VALUES ($userId, '$word', '$type', '$level', '$trans', '$phone', '$date', $ts, $isF, $isM, $eL, $eN, $rL, $rN)
                    ON DUPLICATE KEY UPDATE 
                    level='$level', translation='$trans', is_finished=$isF, is_in_match=$isM, eng_level=$eL, eng_next_review=$eN, rus_level=$rL, rus_next_review=$rN";
            $conn->query($sql);
            echo json_encode(array("success" => true));
            break;

        case 'data/word/stats/save':
            authGuard($userId);
            $word = $conn->real_escape_string($input['word']);
            $mode = $conn->real_escape_string($input['mode']);
            $s = $input['s'];
            $v = (int)$s['views']; 
            $s0=(int)$s['scores'][0]; $s1=(int)$s['scores'][1]; $s2=(int)$s['scores'][2]; $s3=(int)$s['scores'][3]; $s4=(int)$s['scores'][4];
            $te=(int)$s['totalEarned']; $tl=(int)$s['totalLost'];

            $sql = "INSERT INTO word_stats (user_id, word, mode, views, score_0, score_1, score_2, score_3, score_4, total_earned, total_lost)
                    VALUES ($userId, '$word', '$mode', $v, $s0, $s1, $s2, $s3, $s4, $te, $tl)
                    ON DUPLICATE KEY UPDATE views=$v, score_0=$s0, score_1=$s1, score_2=$s2, score_3=$s3, score_4=$s4, total_earned=$te, total_lost=$tl";
            $conn->query($sql);
            echo json_encode(array("success" => true));
            break;

        case 'data/settings/save':
            authGuard($userId);
            $sc = (int)$input['streak_count']; 
            $sld = $conn->real_escape_string($input['streak_last_date']);
            $mbr = $conn->real_escape_string($input['month_best_record']); 
            $mbm = $conn->real_escape_string($input['month_best_month']);
            $conn->query("UPDATE user_settings SET streak_count=$sc, streak_last_date='$sld', month_best_record='$mbr', month_best_month='$mbm' WHERE user_id=$userId");
            echo json_encode(array("success" => true));
            break;

        case 'data/full-migration':
            authGuard($userId);
            $conn->query("DELETE FROM user_words WHERE user_id = $userId");
            $conn->query("DELETE FROM word_stats WHERE user_id = $userId");
            if (isset($input['learned'])) foreach ($input['learned'] as $w) customSaveWord($conn, $userId, $w, 0, 0);
            if (isset($input['finished'])) foreach ($input['finished'] as $w) customSaveWord($conn, $userId, $w, 1, 0);
            if (isset($input['match'])) foreach ($input['match'] as $w) customSaveWord($conn, $userId, $w, 0, 1);
            echo json_encode(array("message" => "Migration success"));
            break;

        default:
            sendError("Endpoint '$path' not found", 404);
            break;
    }
} catch (Exception $e) {
    sendError("Global error: " . $e->getMessage());
}

function customSaveWord($conn, $uid, $w, $isF, $isM) {
    $word = $conn->real_escape_string($w['word']);
    $type = isset($w['type']) ? $conn->real_escape_string($w['type']) : '';
    $level = isset($w['level']) ? $conn->real_escape_string($w['level']) : '';
    $trans = isset($w['translation']) ? $conn->real_escape_string($w['translation']) : '';
    $phone = isset($w['phonetic']) ? $conn->real_escape_string($w['phonetic']) : '';
    $date = isset($w['learnedDate']) ? $conn->real_escape_string($w['learnedDate']) : '';
    $ts = isset($w['timestampAdded']) ? (float)$w['timestampAdded'] : 0;
    
    $eL = isset($w['progress']['eng']['level']) ? (int)$w['progress']['eng']['level'] : 1; 
    $eN = isset($w['progress']['eng']['nextReview']) ? (float)$w['progress']['eng']['nextReview'] : 0;
    $rL = isset($w['progress']['rus']['level']) ? (int)$w['progress']['rus']['level'] : 1; 
    $rN = isset($w['progress']['rus']['nextReview']) ? (float)$w['progress']['rus']['nextReview'] : 0;

    $sql = "INSERT INTO user_words (user_id, word, type, level, translation, phonetic, learned_date, timestamp_added, is_finished, is_in_match, eng_level, eng_next_review, rus_level, rus_next_review) 
            VALUES ($uid, '$word', '$type', '$level', '$trans', '$phone', '$date', $ts, $isF, $isM, $eL, $eN, $rL, $rN)";
    $conn->query($sql);
    
    if (isset($w['stats'])) {
        foreach (array('eng', 'rus') as $m) {
            if (!isset($w['stats'][$m])) continue;
            $s = $w['stats'][$m];
            $v = (int)$s['views']; 
            $s0=(int)$s['scores'][0]; $s1=(int)$s['scores'][1]; $s2=(int)$s['scores'][2]; $s3=(int)$s['scores'][3]; $s4=(int)$s['scores'][4];
            $te=(int)$s['totalEarned']; $tl=(int)$s['totalLost'];
            $conn->query("INSERT INTO word_stats (user_id, word, mode, views, score_0, score_1, score_2, score_3, score_4, total_earned, total_lost) VALUES ($uid, '$word', '$m', $v, $s0, $s1, $s2, $s3, $s4, $te, $tl)");
        }
    }
}

$conn->close();
?>
