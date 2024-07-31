# APRS.fi-API-web
A simple website that uses the API from the aprs.fi server  information

## Do not forget!
In the script.js file:

Change MYCALL-1 to your call sign.
```javascript
const url = 'api-proxy.php?name=MYCALL-1&what=loc'
```

In the api-proxy.php file:

Change YOUR_API_KEY to your api key obtained from [APRS.fy](https://aprs.fi/)
```php
$api_key = 'YOUR_API_KEY';
```
