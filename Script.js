// Backend API URL (change this if your server runs on a different URL)
const API_URL = 'http://localhost:3000';

// These functions are now globally accessible
function openPopup() {
    document.getElementById("loginPopup").classList.add("active");
}

function closePopup() {
    document.getElementById("loginPopup").classList.remove("active");
    resetLoginForm();
}

// Reset login form to initial state
function resetLoginForm() {
    const form = document.getElementById('loginForm');
    if (form) form.reset();
    
    const phoneInput = document.querySelector('input[placeholder="Enter Mobile Number"]');
    const otpInput = document.querySelector('input[placeholder="Enter OTP"]');
    const sendBtn = document.querySelector('.send-otp-btn');
    const resendLink = document.querySelector('.resend-link');
    
    if (phoneInput) phoneInput.style.display = 'block';
    if (otpInput) otpInput.style.display = 'none';
    if (sendBtn) sendBtn.style.display = 'inline-block';
    if (resendLink) resendLink.style.display = 'none';
}

// Send OTP function (calls backend API)
async function sendOTP() {
    const phoneInput = document.querySelector('input[placeholder="Enter Mobile Number"]');
    const phoneNumber = phoneInput.value.trim();
    
    // Validate phone number
    if (!phoneNumber || phoneNumber.length !== 10 || !/^\d{10}$/.test(phoneNumber)) {
        alert('Please enter a valid 10-digit mobile number');
        return;
    }

    const sendBtn = document.querySelector('.send-otp-btn');
    sendBtn.disabled = true;
    sendBtn.textContent = 'Sending...';

    try {
        const response = await fetch(`${API_URL}/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber })
        });

        const data = await response.json();

        if (response.ok) {
            alert('✅ OTP sent successfully to +91' + phoneNumber);
            console.log('✅ OTP sent to:', phoneNumber);
            
            // Hide phone input, show OTP input
            const phoneInput = document.querySelector('input[placeholder="Enter Mobile Number"]');
            const otpInput = document.querySelector('input[placeholder="Enter OTP"]');
            const resendLink = document.querySelector('.resend-link');
            
            phoneInput.style.display = 'none';
            otpInput.style.display = 'block';
            otpInput.focus();
            sendBtn.style.display = 'none';
            document.querySelector('button[type="submit"]').style.display = 'block';
            if (resendLink) resendLink.style.display = 'inline';
            
            // Store phone number for verification
            document.getElementById('loginForm').dataset.phoneNumber = phoneNumber;
            
            // Start resend timer
            startResendTimer();
        } else {
            alert('❌ ' + (data.error || 'Failed to send OTP'));
            console.error('Error:', data.error);
            sendBtn.disabled = false;
            sendBtn.textContent = 'Send OTP';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: Make sure the backend server is running on http://localhost:3000');
        sendBtn.disabled = false;
        sendBtn.textContent = 'Send OTP';
    }
}

// Resend OTP with timer
let resendTimer = 0;
function startResendTimer() {
    resendTimer = 30;
    const resendLink = document.querySelector('.resend-link a');
    if (resendLink) {
        resendLink.style.pointerEvents = 'none';
        resendLink.style.opacity = '0.5';
        resendLink.textContent = `Resend OTP in ${resendTimer}s`;
        
        const interval = setInterval(() => {
            resendTimer--;
            if (resendTimer <= 0) {
                clearInterval(interval);
                resendLink.style.pointerEvents = 'auto';
                resendLink.style.opacity = '1';
                resendLink.textContent = 'Resend';
            } else {
                resendLink.textContent = `Resend OTP in ${resendTimer}s`;
            }
        }, 1000);
    }
}

// Verify OTP function (calls backend API)
async function verifyOTP(event) {
    event.preventDefault();
    
    const form = document.getElementById('loginForm');
    const phoneNumber = form.dataset.phoneNumber;
    const otpInput = document.querySelector('input[placeholder="Enter OTP"]');
    const otp = otpInput.value.trim();
    
    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
        alert('Please enter a valid 6-digit OTP');
        return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';

    try {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber, otp })
        });

        const data = await response.json();

        if (response.ok) {
            alert(`✅ Login successful!\nWelcome +91${phoneNumber}`);
            console.log('✅ User logged in:', phoneNumber);
            
            // Store user session
            localStorage.setItem('userPhone', phoneNumber);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            closePopup();
        } else {
            alert('❌ ' + (data.error || 'Invalid OTP'));
            console.error('Error:', data.error);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error: Make sure the backend server is running on http://localhost:3000');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

document.addEventListener("DOMContentLoaded", function() {

    // --- Popup Functionality ---
    const loginPopup = document.getElementById('loginPopup');
    const closeBtn = document.querySelector('.close-btn');

    // Event listener to close the popup when the close button is clicked
    closeBtn.addEventListener('click', closePopup);
    
    // Event listener to close the popup when the overlay is clicked
    loginPopup.addEventListener('click', (e) => {
        if (e.target === loginPopup) {
            closePopup();
        }
    });

    // --- Mobile Menu Toggle ---
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.nav');

    // Toggles the 'show' class to display/hide the mobile navigation menu
    menuToggle.addEventListener('click', () => {
        nav.classList.toggle('show');
    });

    // Close menu on link click (for mobile)
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('show')) {
                nav.classList.remove('show');
            }
        });
    });

    // Ensure every product card has hidden .ingredients and .quantity placeholders
    document.querySelectorAll('.product-card').forEach(card => {
        if (!card.querySelector('.ingredients')) {
            const p = document.createElement('p');
            p.className = 'ingredients';
            p.style.display = 'none';
            p.textContent = '';
            card.appendChild(p);
        }
        if (!card.querySelector('.quantity')) {
            const p2 = document.createElement('p');
            p2.className = 'quantity';
            p2.style.display = 'none';
            p2.textContent = '';
            card.appendChild(p2);
        }
    });

    // --- Shopping Cart Setup ---
    let cart = JSON.parse(localStorage.getItem('cart') || '{}');

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    function updateCartCount() {
        const count = Object.values(cart).reduce((s, it) => s + it.qty, 0);
        const el = document.getElementById('cartCount');
        if (el) el.textContent = count;
    }

    function parseCurrency(text) {
        if (!text) return 0;
        // remove non-digits
        const m = text.replace(/[^0-9]/g, '');
        return parseInt(m || '0', 10);
    }

    function getProductData(card) {
        const title = card.dataset.title || (card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : 'Product');
        const img = card.querySelector('.product-img') ? card.querySelector('.product-img').src : '';
        // Try data attributes first
        const ds = card.dataset || {};
        const mrp = ds.mrp ? parseCurrency(ds.mrp) : (() => { const p = Array.from(card.querySelectorAll('p')).find(x => x.textContent.includes('MRP')); return p ? parseCurrency(p.textContent) : 0; })();
        const price = ds.price ? parseCurrency(ds.price) : (() => { const p = Array.from(card.querySelectorAll('p')).find(x => x.textContent.includes('Price')); return p ? parseCurrency(p.textContent) : mrp; })();
        const save = ds.save ? parseCurrency(ds.save) : (mrp && price ? (mrp - price) : 0);
        const id = (ds.title || title).replace(/\s+/g, '_').toLowerCase();
        return { id, title, img, mrp, price, save };
    }

    function addToCartFromCard(card) {
        const p = getProductData(card);
        if (!cart[p.id]) cart[p.id] = { ...p, qty: 0 };
        cart[p.id].qty += 1;
        saveCart();
        alert(`Added to cart: ${p.title}`);
    }

    // Append Add to Cart buttons to product cards and group with View Product inline
    document.querySelectorAll('.product-card').forEach(card => {
        const addBtn = document.createElement('button');
        addBtn.className = 'add-cart-btn';
        addBtn.textContent = 'Add to Cart';
        addBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            addToCartFromCard(card);
        });

        // Find existing view button
        const viewBtn = card.querySelector('.btn');

        // Ensure there is a container for action buttons
        let actions = card.querySelector('.card-actions');
        if (!actions) {
            actions = document.createElement('div');
            actions.className = 'card-actions';
            // Insert actions after last child (so it appears below content)
            if (viewBtn && viewBtn.parentNode) {
                viewBtn.parentNode.insertBefore(actions, viewBtn);
            } else {
                card.appendChild(actions);
            }
        }

        // Move existing viewBtn into actions if it's not already there
        if (viewBtn && viewBtn.parentNode !== actions) {
            actions.appendChild(viewBtn);
        }

        // Append add button to actions
        actions.appendChild(addBtn);
    });

    // Cart popup handlers
    window.openCart = function() {
        document.getElementById('cartPopup').classList.add('active');
        renderCart();
    }
    window.closeCart = function() {
        document.getElementById('cartPopup').classList.remove('active');
    }

    function renderCart() {
        const tbody = document.getElementById('cartTbody');
        tbody.innerHTML = '';
        let totalMRP = 0, totalPrice = 0, totalSave = 0;
        Object.values(cart).forEach(item => {
            const tr = document.createElement('tr');
            const tdProd = document.createElement('td');
            tdProd.textContent = item.title;

            const tdQty = document.createElement('td');
            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.min = '1';
            qtyInput.value = item.qty;
            qtyInput.style.width = '60px';
            qtyInput.addEventListener('change', () => {
                const v = parseInt(qtyInput.value || '1', 10);
                item.qty = v > 0 ? v : 1;
                saveCart();
                renderCart();
            });
            tdQty.appendChild(qtyInput);

            const tdPrice = document.createElement('td');
            tdPrice.textContent = '₹' + (item.price * item.qty);

            const tdMRP = document.createElement('td');
            tdMRP.textContent = '₹' + (item.mrp * item.qty);

            const tdSave = document.createElement('td');
            tdSave.textContent = '₹' + ((item.mrp - item.price) * item.qty);

            const tdRemove = document.createElement('td');
            const remBtn = document.createElement('button');
            remBtn.className = 'remove-cart-btn';
            remBtn.textContent = 'Remove';
            remBtn.addEventListener('click', () => {
                delete cart[item.id];
                saveCart();
                renderCart();
            });
            tdRemove.appendChild(remBtn);

            tr.appendChild(tdProd);
            tr.appendChild(tdQty);
            tr.appendChild(tdPrice);
            tr.appendChild(tdMRP);
            tr.appendChild(tdSave);
            tr.appendChild(tdRemove);

            tbody.appendChild(tr);

            totalMRP += item.mrp * item.qty;
            totalPrice += item.price * item.qty;
            totalSave += (item.mrp - item.price) * item.qty;
        });

        document.getElementById('cartTotalMRP').textContent = '₹' + totalMRP;
        document.getElementById('cartTotalPrice').textContent = '₹' + totalPrice;
        document.getElementById('cartTotalSave').textContent = '₹' + totalSave;
        updateCartCount();
    }

    window.checkout = function() {
        const total = document.getElementById('cartTotalPrice').textContent;
        alert(`Proceeding to payment. Total: ${total}`);
        // Implement payment integration here later
    }

    // initialize count
    updateCartCount();

    // --- Product Detail Popup (View Product buttons) ---
    const productPopup = document.getElementById('productPopup');
    if (productPopup) {
        const popupImage = document.getElementById('popupImage');
        const popupTitle = document.getElementById('popupTitle');
        const popupMRP = document.getElementById('popupMRP');
        const popupDiscount = document.getElementById('popupDiscount');
        const popupPrice = document.getElementById('popupPrice');
        const popupSave = document.getElementById('popupSave');

        function openProductPopup() { productPopup.classList.add('active'); }
        function closeProductPopup() { productPopup.classList.remove('active'); }

        // Close handlers
        const productCloseTop = document.querySelector('.product-close-btn');
        const popupCloseBtn = document.getElementById('popupCloseBtn');
        if (productCloseTop) productCloseTop.addEventListener('click', closeProductPopup);
        if (popupCloseBtn) popupCloseBtn.addEventListener('click', closeProductPopup);

        productPopup.addEventListener('click', (e) => { if (e.target === productPopup) closeProductPopup(); });

        // Attach handler to each View Product button
        document.querySelectorAll('.product-card .btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const card = btn.closest('.product-card');
                if (!card) return;

                const img = card.querySelector('.product-img');
                const titleEl = card.querySelector('h3');

                // Fill image and alt
                popupImage.src = img ? img.src : '';
                popupImage.alt = img ? img.alt : '';

                // Prefer data-* attributes when available
                const ds = card.dataset || {};

                popupTitle.textContent = ds.title || (titleEl ? titleEl.textContent : '');

                if (ds.mrp || ds.discount || ds.price || ds.save) {
                    popupMRP.textContent = ds.mrp ? 'MRP: ' + ds.mrp : '';
                    popupDiscount.textContent = ds.discount ? 'Discount: ' + ds.discount : '';
                    popupPrice.textContent = ds.price ? 'Price: ' + ds.price : '';
                    popupSave.textContent = ds.save ? 'Save upto: ' + ds.save : '';
                } else {
                    // parse paragraphs
                    popupMRP.textContent = popupDiscount.textContent = popupPrice.textContent = popupSave.textContent = '';
                    card.querySelectorAll('p').forEach(p => {
                        const strong = p.querySelector('strong');
                        if (!strong) return;
                        const key = strong.textContent.replace(':','').trim().toLowerCase();
                        const val = p.textContent.replace(strong.textContent,'').trim();
                        if (key.includes('mrp')) popupMRP.textContent = 'MRP: ' + val;
                        else if (key.includes('discount')) popupDiscount.textContent = 'Discount: ' + val;
                        else if (key.includes('price')) popupPrice.textContent = 'Price: ' + val;
                        else if (key.includes('save')) popupSave.textContent = 'Save upto: ' + val;
                    });
                }

                // optional description
                const existingDesc = document.getElementById('popupDescription');
                if (ds.description) {
                    if (existingDesc) existingDesc.textContent = ds.description;
                    else {
                        const p = document.createElement('p');
                        p.id = 'popupDescription';
                        p.textContent = ds.description;
                        popupPrice.parentNode.appendChild(p);
                    }
                } else if (existingDesc) {
                    existingDesc.remove();
                }

                // Populate ingredients and quantity (prefer data-* attributes)
                const popupIngredients = document.getElementById('popupIngredients');
                const popupQuantity = document.getElementById('popupQuantity');
                if (ds.ingredients) popupIngredients.textContent = ds.ingredients;
                else {
                    const ing = card.querySelector('.ingredients');
                    popupIngredients.textContent = ing ? ing.textContent : '';
                }

                if (ds.quantity) popupQuantity.textContent = ds.quantity;
                else {
                    const qty = card.querySelector('.quantity');
                    popupQuantity.textContent = qty ? qty.textContent : '';
                }

                // Hide grid if both fields are empty
                const grid = document.querySelector('.product-details-grid');
                if (grid) {
                    if ((!popupIngredients.textContent || popupIngredients.textContent.trim() === '') && (!popupQuantity.textContent || popupQuantity.textContent.trim() === '')) {
                        grid.style.display = 'none';
                    } else {
                        grid.style.display = '';
                    }
                }

                // Populate the 2x3 table below the grid
                const table = document.getElementById('popupTable');
                if (table) {
                    const ingText = ds.ingredients || popupIngredients.textContent || '';
                    const qtyText = ds.quantity || popupQuantity.textContent || '';

                    const ingItems = ingText.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    const qtyItems = qtyText.split(',').map(s => s.trim()).filter(s => s.length > 0);

                        // Determine whether any quantity data exists
                        const hasAnyQty = qtyItems.length > 0 && qtyItems.some(q => q && q.trim() !== '');

                        // Reset header visibility/colspan based on presence of quantity
                        const thead = table.tHead;
                        if (thead && thead.rows.length) {
                            const ths = thead.rows[0].cells;
                            if (hasAnyQty) {
                                if (ths[0]) ths[0].colSpan = 1;
                                if (ths[1]) ths[1].style.display = '';
                                ths[0].textContent = 'Ingredients';
                                ths[1].textContent = 'Quantity';
                            } else {
                                if (ths[0]) ths[0].colSpan = 2;
                                if (ths[1]) ths[1].style.display = 'none';
                                ths[0].textContent = 'Ingredients';
                            }
                        }

                        // Build table rows dynamically based on longest list
                        const maxRows = Math.max(ingItems.length, hasAnyQty ? qtyItems.length : 0, 1);
                        const tbody = table.tBodies[0];
                        // clear existing rows
                        while (tbody.firstChild) tbody.removeChild(tbody.firstChild);

                        for (let i = 0; i < maxRows; i++) {
                            const tr = document.createElement('tr');
                            const ingTd = document.createElement('td');
                            ingTd.className = 'tab-ing';
                            const ingText = ingItems[i] || '';
                            if (hasAnyQty) {
                                ingTd.colSpan = 1;
                            } else {
                                ingTd.colSpan = 2;
                            }
                            ingTd.textContent = ingText;
                            tr.appendChild(ingTd);

                            if (hasAnyQty) {
                                const qtyTd = document.createElement('td');
                                qtyTd.className = 'tab-qty';
                                qtyTd.textContent = qtyItems[i] || '';
                                tr.appendChild(qtyTd);
                            }

                            tbody.appendChild(tr);
                        }

                        // Hide the table if all generated cells are empty
                        const allCells = Array.from(table.querySelectorAll('td'));
                        const anyContent = allCells.some(td => td.textContent && td.textContent.trim() !== '');
                        table.style.display = anyContent ? '' : 'none';
                }

                openProductPopup();
            });
        });
    }

});