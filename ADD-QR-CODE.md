# 📱 Add Your QR Code - Simple Instructions

## 🎯 STEP 1: Save Your QR Code Image
1. Right-click on your QR code image
2. Save it as: `upi-qr-code.png` or `upi-qr-code.jpg`
3. Place it in the `/images/` folder of your project

## 🔧 STEP 2: Update the Checkout Page
Replace the current QR placeholder section in `checkout/index.html`:

**Find this section:**
```html
<div class="qr-placeholder">
    <div class="qr-info">
        <i class="fas fa-qrcode" style="font-size: 3rem; color: #4285f4; margin-bottom: 15px;"></i>
        <!-- ... rest of placeholder content ... -->
    </div>
</div>
```

**Replace it with:**
```html
<img src="../images/upi-qr-code.png" alt="UPI QR Code" style="width: 200px; height: 200px; border: 2px solid #f0f0f0; border-radius: 10px; margin: 15px auto; display: block;">
<p>Scan QR code to pay with any UPI app</p>
<p><strong>Saravana Sachin</strong></p>
```

## 🌐 Result
Your QR code will appear perfectly on the checkout page when customers select UPI payment!

## 💡 Alternative: Quick Fix
If you want the QR code to show immediately:
1. Save your QR code as `upi-qr-code.png` in `/images/` folder
2. The current page will automatically work once the file is added

Your UPI payment is ready to accept payments! 🎉