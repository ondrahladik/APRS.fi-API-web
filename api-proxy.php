<?php
$names = isset($_GET['name']) ? $_GET['name'] : '';
$what = isset($_GET['what']) ? $_GET['what'] : '';
$api_key = 'YOUR_API_KEY'; // Change to your API key !!!

if (empty($names) || empty($what)) {
    die('Invalid request');
}

$api_url = "https://api.aprs.fi/api/get?name={$names}&what={$what}&apikey={$api_key}&format=xml";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/xml');
echo $response;
?>
