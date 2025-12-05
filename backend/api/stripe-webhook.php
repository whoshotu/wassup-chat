<?php
/**
 * Stripe Webhook Handler
 */

require_once '../config/database.php';

$database = new Database();
$db = $database->getConnection();

$stripe_secret = getenv('STRIPE_WEBHOOK_SECRET') ?: '';
$payload = @file_get_contents('php://input');
$sig_header = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

try {
    // Verify webhook signature
    $event = verifyStripeWebhook($payload, $sig_header, $stripe_secret);
    
    // Handle the event
    switch ($event['type']) {
        case 'checkout.session.completed':
            handleCheckoutCompleted($db, $event['data']['object']);
            break;
            
        case 'customer.subscription.updated':
            handleSubscriptionUpdated($db, $event['data']['object']);
            break;
            
        case 'customer.subscription.deleted':
            handleSubscriptionDeleted($db, $event['data']['object']);
            break;
            
        case 'invoice.payment_succeeded':
            handlePaymentSucceeded($db, $event['data']['object']);
            break;
            
        case 'invoice.payment_failed':
            handlePaymentFailed($db, $event['data']['object']);
            break;
            
        default:
            error_log('Unhandled event type: ' . $event['type']);
    }
    
    http_response_code(200);
    echo json_encode(['status' => 'success']);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

function verifyStripeWebhook($payload, $sig_header, $secret) {
    $event = json_decode($payload, true);
    
    // In production, verify the signature properly
    // For now, basic validation
    if (!$event || !isset($event['type'])) {
        throw new Exception('Invalid payload');
    }
    
    return $event;
}

function handleCheckoutCompleted($db, $session) {
    $customer_id = $session['customer'];
    $subscription_id = $session['subscription'];
    
    // Update user's subscription
    $stmt = $db->prepare("
        UPDATE subscriptions s
        JOIN users u ON s.user_id = u.id
        SET s.stripe_subscription_id = ?,
            s.status = 'active',
            s.plan_type = ?
        WHERE u.stripe_customer_id = ?
    ");
    
    $plan_type = getPlanTypeFromSession($session);
    $stmt->execute([$subscription_id, $plan_type, $customer_id]);
}

function handleSubscriptionUpdated($db, $subscription) {
    $subscription_id = $subscription['id'];
    $status = $subscription['status'];
    
    $stmt = $db->prepare("
        UPDATE subscriptions 
        SET status = ?,
            current_period_start = FROM_UNIXTIME(?),
            current_period_end = FROM_UNIXTIME(?),
            cancel_at_period_end = ?
        WHERE stripe_subscription_id = ?
    ");
    
    $stmt->execute([
        $status,
        $subscription['current_period_start'],
        $subscription['current_period_end'],
        $subscription['cancel_at_period_end'] ? 1 : 0,
        $subscription_id
    ]);
}

function handleSubscriptionDeleted($db, $subscription) {
    $subscription_id = $subscription['id'];
    
    $stmt = $db->prepare("
        UPDATE subscriptions 
        SET status = 'canceled',
            plan_type = 'free'
        WHERE stripe_subscription_id = ?
    ");
    
    $stmt->execute([$subscription_id]);
}

function handlePaymentSucceeded($db, $invoice) {
    // Log successful payment
    error_log('Payment succeeded for subscription: ' . $invoice['subscription']);
}

function handlePaymentFailed($db, $invoice) {
    $subscription_id = $invoice['subscription'];
    
    $stmt = $db->prepare("
        UPDATE subscriptions 
        SET status = 'past_due'
        WHERE stripe_subscription_id = ?
    ");
    
    $stmt->execute([$subscription_id]);
}

function getPlanTypeFromSession($session) {
    // Determine plan type from session metadata or line items
    $metadata = $session['metadata'] ?? [];
    return $metadata['plan_type'] ?? 'basic';
}
