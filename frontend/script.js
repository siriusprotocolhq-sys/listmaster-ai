document.addEventListener('DOMContentLoaded', () => {
    // Tabs Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });

    // Copy to Clipboard
    const copyBtns = document.querySelectorAll('.copy-btn');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.dataset.copy;
            const contentElement = document.getElementById(targetId);
            let textToCopy = '';
            
            if (contentElement.tagName === 'UL') {
                const lis = contentElement.querySelectorAll('li');
                lis.forEach(li => textToCopy += `• ${li.innerText}\n`);
            } else {
                textToCopy = contentElement.innerText;
            }
            
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Copied to clipboard!');
            });
        });
    });

    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.innerText = msg;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    }

    // Generate Listings Logic
    const generateBtn = document.getElementById('generateBtn');
    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');
    const productNameInput = document.getElementById('productName');

    generateBtn.addEventListener('click', async () => {
        const productName = productNameInput.value.trim();
        if (!productName) {
            alert("Please enter a product name or details.");
            return;
        }

        loading.classList.remove('hidden');
        generateBtn.disabled = true;
        resultsSection.classList.add('hidden');

        try {
            const response = await fetch('/api/analyze-product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ product_name: productName })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || "API Error");
            }

            const data = await response.json();
            
            // Populate Amazon
            document.getElementById('amz-title').innerText = data.amazon.title;
            document.getElementById('amz-bullets').innerHTML = data.amazon.bullet_points.map(b => `<li>${b}</li>`).join('');
            document.getElementById('amz-desc').innerText = data.amazon.description;
            document.getElementById('amz-terms').innerText = data.amazon.search_terms;

            // Populate Flipkart
            document.getElementById('fk-title').innerText = data.flipkart.title;
            document.getElementById('fk-highlights').innerHTML = data.flipkart.highlights.map(h => `<li>${h}</li>`).join('');
            const specs = data.flipkart.specifications;
            document.getElementById('fk-specs').innerHTML = Object.keys(specs).map(k => `<strong>${k}</strong>: ${specs[k]}<br>`).join('');

            // Populate Meesho
            document.getElementById('ms-title').innerText = data.meesho.title;
            document.getElementById('ms-desc').innerText = data.meesho.description;
            document.getElementById('ms-tags').innerText = data.meesho.tags;

            resultsSection.classList.remove('hidden');
        } catch (err) {
            alert(`Generation failed: ${err.message}`);
        } finally {
            loading.classList.add('hidden');
            generateBtn.disabled = false;
        }
    });
});
