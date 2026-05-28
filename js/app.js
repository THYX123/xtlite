(function () {
    'use strict';

    var COINS = [
        { symbol: 'BTC', name: 'Bitcoin', pair: 'USDT', price: 67542.30, color: '#F7931A' },
        { symbol: 'ETH', name: 'Ethereum', pair: 'USDT', price: 3521.80, color: '#627EEA' },
        { symbol: 'SOL', name: 'Solana', pair: 'USDT', price: 178.45, color: '#9945FF' },
        { symbol: 'BNB', name: 'BNB', pair: 'USDT', price: 612.30, color: '#F0B90B' },
        { symbol: 'XRP', name: 'Ripple', pair: 'USDT', price: 0.5234, color: '#23292F' },
        { symbol: 'ADA', name: 'Cardano', pair: 'USDT', price: 0.4521, color: '#0033AD' },
        { symbol: 'DOGE', name: 'Dogecoin', pair: 'USDT', price: 0.1632, color: '#C2A633' },
        { symbol: 'AVAX', name: 'Avalanche', pair: 'USDT', price: 38.72, color: '#E84142' },
        { symbol: 'DOT', name: 'Polkadot', pair: 'USDT', price: 7.23, color: '#E6007A' },
        { symbol: 'MATIC', name: 'Polygon', pair: 'USDT', price: 0.7234, color: '#8247E5' },
        { symbol: 'LINK', name: 'Chainlink', pair: 'USDT', price: 14.56, color: '#2A5ADA' },
        { symbol: 'UNI', name: 'Uniswap', pair: 'USDT', price: 7.89, color: '#FF007A' }
    ];

    var favorites = ['BTC', 'ETH', 'SOL', 'BNB'];

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function formatNum(n, decimals) {
        if (decimals === undefined) decimals = 2;
        return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    }

    function showToast(msg, type) {
        var toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = 'toast show' + (type ? ' ' + type : '');
        clearTimeout(toast._timer);
        toast._timer = setTimeout(function () {
            toast.className = 'toast';
        }, 2500);
    }

    function oops() {
        showToast('Oops!', 'oops');
    }

    function showLoading(text) {
        var el = document.getElementById('global-loading');
        var txt = el.querySelector('.spinner-text');
        txt.textContent = text || '加载中...';
        el.style.display = 'flex';
    }

    function hideLoading() {
        document.getElementById('global-loading').style.display = 'none';
    }

    function withLoading(text, callback, duration) {
        showLoading(text);
        setTimeout(function () {
            callback();
            hideLoading();
        }, duration || 500);
    }

    function initOopsButtons() {
        document.querySelectorAll('.oops-btn').forEach(function (btn) {
            if (btn._oopsBound) return;
            btn._oopsBound = true;
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                oops();
            });
        });
        document.querySelectorAll('.link-oops').forEach(function (link) {
            if (link._oopsBound) return;
            link._oopsBound = true;
            link.addEventListener('click', function (e) {
                e.preventDefault();
                oops();
            });
        });
    }

    function initLogin() {
        var form = document.getElementById('login-form');
        var togglePwd = document.getElementById('toggle-pwd');
        var pwdInput = document.getElementById('login-password');

        togglePwd.addEventListener('click', function () {
            var type = pwdInput.type === 'password' ? 'text' : 'password';
            pwdInput.type = type;
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var email = document.getElementById('login-email').value.trim();
            var pwd = document.getElementById('login-password').value.trim();
            if (!email || !pwd) {
                showToast('请输入邮箱和密码', 'oops');
                return;
            }
            var btn = form.querySelector('.btn-login');
            btn.textContent = '登录中...';
            btn.disabled = true;
            showLoading('验证账户...');
            setTimeout(function () {
                hideLoading();
                btn.textContent = '登 录';
                btn.disabled = false;
                document.querySelector('.login-container:not(#login-2fa)').style.display = 'none';
                document.getElementById('login-2fa').style.display = 'block';
                document.querySelectorAll('.otp-input')[0].focus();
            }, 1000);
        });

        var otpInputs = document.querySelectorAll('.otp-input');
        otpInputs.forEach(function (input, idx) {
            input.addEventListener('input', function () {
                var val = input.value.replace(/[^0-9]/g, '');
                input.value = val;
                if (val) {
                    input.classList.add('filled');
                    if (idx < 5) {
                        otpInputs[idx + 1].focus();
                    }
                } else {
                    input.classList.remove('filled');
                }
            });
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !input.value && idx > 0) {
                    otpInputs[idx - 1].focus();
                    otpInputs[idx - 1].value = '';
                    otpInputs[idx - 1].classList.remove('filled');
                }
            });
            input.addEventListener('paste', function (e) {
                e.preventDefault();
                var paste = (e.clipboardData || window.clipboardData).getData('text').replace(/[^0-9]/g, '');
                for (var i = 0; i < Math.min(paste.length, 6); i++) {
                    otpInputs[i].value = paste[i];
                    otpInputs[i].classList.add('filled');
                }
                if (paste.length >= 6) {
                    otpInputs[5].focus();
                } else if (paste.length > 0) {
                    otpInputs[Math.min(paste.length, 5)].focus();
                }
            });
        });

        document.getElementById('login-2fa-form').addEventListener('submit', function (e) {
            e.preventDefault();
            var code = '';
            otpInputs.forEach(function (input) { code += input.value; });
            if (code.length < 6) {
                showToast('请输入6位验证码', 'oops');
                return;
            }
            var btn = document.getElementById('btn-2fa-submit');
            btn.textContent = '验证中...';
            btn.disabled = true;
            showLoading('安全验证中...');
            setTimeout(function () {
                hideLoading();
                document.getElementById('login-page').style.display = 'none';
                document.getElementById('app').style.display = 'flex';
                showToast('登录成功，欢迎回来！', 'success');
                initApp();
                btn.textContent = '验 证';
                btn.disabled = false;
                otpInputs.forEach(function (input) {
                    input.value = '';
                    input.classList.remove('filled');
                });
                document.querySelector('.login-container:not(#login-2fa)').style.display = '';
                document.getElementById('login-2fa').style.display = 'none';
            }, 1000);
        });
    }

    function initNavigation() {
        var navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(function (item) {
            item.addEventListener('click', function () {
                var page = item.getAttribute('data-page');
                switchPage(page);
            });
        });

        var sidebarUser = document.querySelector('.sidebar-user');
        if (sidebarUser) {
            sidebarUser.addEventListener('click', function () {
                switchPage('account');
            });
        }
    }

    function switchPage(pageName) {
        var pageLabels = {
            market: '',
            trade: '',
            buy: '',
            records: '',
            account: ''
        };
        withLoading(pageLabels[pageName] || '加载中...', function () {
            document.querySelectorAll('.nav-item').forEach(function (n) {
                n.classList.toggle('active', n.getAttribute('data-page') === pageName);
            });
            document.querySelectorAll('.page').forEach(function (p) {
                p.classList.remove('active');
            });
            var target = document.getElementById('page-' + pageName);
            if (target) {
                target.classList.add('active');
            }
            if (pageName === 'trade') {
                setTimeout(drawChart, 100);
            }
        }, 500);
    }

    function initMarket() {
        renderMarketTable();

        document.querySelectorAll('.market-tabs .tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.market-tabs .tab-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                renderMarketTable(btn.getAttribute('data-tab'));
            });
        });
    }

    function renderMarketTable(tab) {
        var tbody = document.getElementById('market-tbody');
        if (!tbody) return;
        var coins = COINS.map(function (c) {
            var change = rand(-8, 8);
            var high = c.price * (1 + Math.abs(change) / 100 + rand(0, 1) / 100);
            var low = c.price * (1 - Math.abs(change) / 100 - rand(0, 1) / 100);
            var vol = rand(1000, 50000);
            var amount = vol * c.price;
            return Object.assign({}, c, {
                change: change,
                high: high,
                low: low,
                volume: vol,
                amount: amount
            });
        });

        if (tab === 'favorites') {
            coins = coins.filter(function (c) { return favorites.indexOf(c.symbol) > -1; });
        } else if (tab === 'btc') {
            coins = coins.filter(function (c) { return c.symbol === 'BTC' || c.pair === 'BTC'; });
            if (coins.length === 0) {
                coins = [Object.assign({}, COINS[0], { change: rand(-8, 8), high: COINS[0].price * 1.03, low: COINS[0].price * 0.97, volume: rand(1000, 50000), amount: 0 })];
                coins[0].amount = coins[0].volume * coins[0].price;
            }
        } else if (tab === 'eth') {
            coins = coins.filter(function (c) { return c.symbol === 'ETH'; });
            if (coins.length === 0) {
                coins = [Object.assign({}, COINS[1], { change: rand(-8, 8), high: COINS[1].price * 1.03, low: COINS[1].price * 0.97, volume: rand(1000, 50000), amount: 0 })];
                coins[0].amount = coins[0].volume * coins[0].price;
            }
        } else if (tab === 'new') {
            coins = coins.slice(-3);
        }

        var html = '';
        coins.forEach(function (c) {
            var isFav = favorites.indexOf(c.symbol) > -1;
            var changeClass = c.change >= 0 ? 'price-up' : 'price-down';
            var changePrefix = c.change >= 0 ? '+' : '';
            var decimals = c.price > 100 ? 2 : c.price > 1 ? 4 : 4;
            html += '<tr>' +
                '<td><button class="star-btn' + (isFav ? ' active' : '') + '" data-symbol="' + c.symbol + '"><svg width="16" height="16" viewBox="0 0 24 24" fill="' + (isFav ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></button></td>' +
                '<td><div class="coin-cell"><div class="coin-icon" style="background:' + c.color + '">' + c.symbol.charAt(0) + '</div><div><div class="coin-name">' + c.symbol + '</div><div class="coin-pair">' + c.symbol + '/' + c.pair + '</div></div></div></td>' +
                '<td class="' + changeClass + '">' + formatNum(c.price, decimals) + '</td>' +
                '<td class="' + changeClass + '">' + changePrefix + c.change.toFixed(2) + '%</td>' +
                '<td>' + formatNum(c.high, decimals) + '</td>' +
                '<td>' + formatNum(c.low, decimals) + '</td>' +
                '<td>' + formatNum(c.volume, 0) + '</td>' +
                '<td>' + formatNum(c.amount, 0) + '</td>' +
                '</tr>';
        });
        tbody.innerHTML = html;

        tbody.querySelectorAll('.star-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var sym = btn.getAttribute('data-symbol');
                var idx = favorites.indexOf(sym);
                if (idx > -1) {
                    favorites.splice(idx, 1);
                    btn.classList.remove('active');
                    btn.querySelector('svg').setAttribute('fill', 'none');
                } else {
                    favorites.push(sym);
                    btn.classList.add('active');
                    btn.querySelector('svg').setAttribute('fill', 'currentColor');
                }
            });
        });
    }

    var currentTradeCoin = 'BTC';

    function getCurrentCoinData() {
        return COINS.find(function(c) { return c.symbol === currentTradeCoin; }) || COINS[0];
    }

    function initTrade() {
        updateTradeCoinDisplay();
        drawChart();
        renderOrderBook();
        renderRecentTrades();

        document.getElementById('trade-coin-select').addEventListener('change', function() {
            currentTradeCoin = this.value;
            updateTradeCoinDisplay();
            drawChart();
            renderOrderBook();
            renderRecentTrades();
        });

        document.querySelectorAll('.chart-period').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.chart-period').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                drawChart();
            });
        });

        document.querySelectorAll('.trade-type-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.trade-type-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var type = btn.getAttribute('data-type');
                var priceGroup = document.getElementById('price-group');
                if (type === 'market') {
                    priceGroup.style.display = 'none';
                } else {
                    priceGroup.style.display = '';
                }
            });
        });

        document.querySelectorAll('.trade-side-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.trade-side-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var side = btn.getAttribute('data-side');
                var submitBtn = document.getElementById('btn-trade-submit');
                submitBtn.className = 'btn-trade ' + side;
                submitBtn.textContent = (side === 'buy' ? '买入' : '卖出') + ' ' + currentTradeCoin;
                var availEl = document.getElementById('trade-available-val');
                availEl.textContent = side === 'buy' ? '82.60 USDT' : getAvailableBalance();
            });
        });

        document.querySelectorAll('.slider-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var pct = parseInt(btn.getAttribute('data-pct'));
                var side = document.querySelector('.trade-side-btn.active').getAttribute('data-side');
                var amount;
                if (side === 'buy') {
                    var total = 82.60;
                    var price = parseFloat(document.getElementById('trade-price').value.replace(/,/g, ''));
                    amount = (total * pct / 100 / price).toFixed(getDecimals());
                } else {
                    var balance = parseFloat(getAvailableBalance().split(' ')[0]);
                    amount = (balance * pct / 100).toFixed(getDecimals());
                }
                document.getElementById('trade-amount').value = amount;
                updateTradeTotal();
            });
        });

        document.getElementById('trade-amount').addEventListener('input', updateTradeTotal);
        document.getElementById('trade-price').addEventListener('input', updateTradeTotal);

        document.getElementById('trade-form').addEventListener('submit', function (e) {
            e.preventDefault();
            var amount = document.getElementById('trade-amount').value;
            if (!amount || parseFloat(amount) <= 0) {
                showToast('请输入有效数量', 'oops');
                return;
            }
            var side = document.querySelector('.trade-side-btn.active').getAttribute('data-side');
            showToast((side === 'buy' ? '买入' : '卖出') + currentTradeCoin + ' 委托已提交！', 'success');
            document.getElementById('trade-amount').value = '';
            updateTradeTotal();
        });
    }

    function getDecimals() {
        var coin = getCurrentCoinData();
        return coin.price > 100 ? 4 : coin.price > 1 ? 4 : 6;
    }

    function getAvailableBalance() {
        var balances = {
            'BTC': '0.00 BTC',
            'ETH': '0.00 ETH',
            'SOL': '0.00 SOL',
            'BNB': '0.00 BNB',
            'XRP': '0.00 XRP',
            'DOGE': '0.00 DOGE'
        };
        if (currentTradeCoin === 'USDT') return '82.60 USDT';
        return balances[currentTradeCoin] || '0.00 ' + currentTradeCoin;
    }

    function updateTradeCoinDisplay() {
        var coin = getCurrentCoinData();
        var decimals = coin.price > 100 ? 2 : coin.price > 1 ? 4 : 6;
        var price = coin.price * (1 + rand(-2, 2) / 100);
        var change = rand(-5, 5);

        document.getElementById('trade-current-price').textContent = formatNum(price, decimals);
        document.getElementById('trade-price').value = formatNum(price, decimals);
        document.getElementById('trade-current-price').className = 'pair-price';
        document.getElementById('book-spread').textContent = formatNum(price, decimals);

        var changeEl = document.querySelector('.pair-change');
        changeEl.textContent = (change >= 0 ? '+' : '') + change.toFixed(2) + '%';
        changeEl.className = 'pair-change ' + (change >= 0 ? 'up' : 'down');
        document.getElementById('trade-current-price').classList.add(change >= 0 ? 'price-up' : 'price-down');

        document.getElementById('recent-coin').textContent = currentTradeCoin;
        document.getElementById('book-coin').textContent = currentTradeCoin;
        document.getElementById('amount-coin').textContent = currentTradeCoin;

        var submitBtn = document.getElementById('btn-trade-submit');
        var side = document.querySelector('.trade-side-btn.active').getAttribute('data-side');
        submitBtn.textContent = (side === 'buy' ? '买入' : '卖出') + ' ' + currentTradeCoin;

        var availEl = document.getElementById('trade-available-val');
        availEl.textContent = side === 'buy' ? '82.60 USDT' : getAvailableBalance();
    }

    function updateTradeTotal() {
        var price = parseFloat(document.getElementById('trade-price').value.replace(/,/g, '')) || 0;
        var amount = parseFloat(document.getElementById('trade-amount').value) || 0;
        var total = price * amount;
        document.getElementById('trade-total-val').textContent = formatNum(total) + ' USDT';
    }

    function drawChart() {
        var canvas = document.getElementById('trade-chart');
        if (!canvas) return;
        var wrap = canvas.parentElement;
        canvas.width = wrap.clientWidth;
        canvas.height = wrap.clientHeight - 40;

        var ctx = canvas.getContext('2d');
        var w = canvas.width;
        var h = canvas.height;
        var padding = { top: 20, right: 60, bottom: 30, left: 10 };

        ctx.clearRect(0, 0, w, h);

        var coin = getCurrentCoinData();
        var points = [];
        var basePrice = coin.price;
        var numPoints = 80;
        var priceRange = basePrice * 0.05;
        for (var i = 0; i < numPoints; i++) {
            basePrice += rand(-priceRange / 40, priceRange / 40);
            basePrice = Math.max(coin.price - priceRange, Math.min(coin.price + priceRange, basePrice));
            points.push(basePrice);
        }

        var minP = Math.min.apply(null, points) - priceRange / 10;
        var maxP = Math.max.apply(null, points) + priceRange / 10;
        var chartW = w - padding.left - padding.right;
        var chartH = h - padding.top - padding.bottom;

        ctx.strokeStyle = 'rgba(43, 49, 57, 0.5)';
        ctx.lineWidth = 1;
        for (var g = 0; g < 5; g++) {
            var gy = padding.top + (chartH / 4) * g;
            ctx.beginPath();
            ctx.moveTo(padding.left, gy);
            ctx.lineTo(w - padding.right, gy);
            ctx.stroke();

            var priceLabel = maxP - ((maxP - minP) / 4) * g;
            var decimals = coin.price > 100 ? 0 : coin.price > 1 ? 2 : 4;
            ctx.fillStyle = '#5E6673';
            ctx.font = '11px DM Sans';
            ctx.textAlign = 'left';
            ctx.fillText(formatNum(priceLabel, decimals), w - padding.right + 8, gy + 4);
        }

        var gradient = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
        gradient.addColorStop(0, 'rgba(14, 203, 129, 0.15)');
        gradient.addColorStop(1, 'rgba(14, 203, 129, 0)');

        ctx.beginPath();
        ctx.moveTo(padding.left, h - padding.bottom);
        for (var j = 0; j < points.length; j++) {
            var x = padding.left + (chartW / (points.length - 1)) * j;
            var y = padding.top + chartH - ((points[j] - minP) / (maxP - minP)) * chartH;
            if (j === 0) {
                ctx.lineTo(x, y);
            } else {
                var prevX = padding.left + (chartW / (points.length - 1)) * (j - 1);
                var prevY = padding.top + chartH - ((points[j - 1] - minP) / (maxP - minP)) * chartH;
                var cpx = (prevX + x) / 2;
                ctx.bezierCurveTo(cpx, prevY, cpx, y, x, y);
            }
        }
        ctx.lineTo(padding.left + chartW, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        for (var k = 0; k < points.length; k++) {
            var px = padding.left + (chartW / (points.length - 1)) * k;
            var py = padding.top + chartH - ((points[k] - minP) / (maxP - minP)) * chartH;
            if (k === 0) {
                ctx.moveTo(px, py);
            } else {
                var ppx = padding.left + (chartW / (points.length - 1)) * (k - 1);
                var ppy = padding.top + chartH - ((points[k - 1] - minP) / (maxP - minP)) * chartH;
                var cpx2 = (ppx + px) / 2;
                ctx.bezierCurveTo(cpx2, ppy, cpx2, py, px, py);
            }
        }
        ctx.strokeStyle = '#0ECB81';
        ctx.lineWidth = 2;
        ctx.stroke();

        var lastX = padding.left + chartW;
        var lastY = padding.top + chartH - ((points[points.length - 1] - minP) / (maxP - minP)) * chartH;
        ctx.beginPath();
        ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#0ECB81';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(lastX, lastY, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(14, 203, 129, 0.2)';
        ctx.fill();
    }

    function renderOrderBook() {
        var asksEl = document.getElementById('book-asks');
        var bidsEl = document.getElementById('book-bids');
        if (!asksEl || !bidsEl) return;

        var coin = getCurrentCoinData();
        var basePrice = coin.price;
        var askHtml = '';
        var bidHtml = '';
        var maxVol = 0;
        var asks = [];
        var bids = [];
        var decimals = coin.price > 100 ? 2 : coin.price > 1 ? 4 : 6;
        var priceStep = coin.price > 100 ? rand(0.5, 3) : coin.price > 1 ? rand(0.01, 0.1) : rand(0.0001, 0.001);

        for (var i = 10; i >= 1; i--) {
            var askPrice = basePrice + i * priceStep;
            var volSize = coin.price > 100 ? rand(0.01, 2) : coin.price > 1 ? rand(0.1, 20) : rand(1, 100);
            var askVol = volSize.toFixed(coin.price > 100 ? 4 : coin.price > 1 ? 4 : 2);
            asks.push({ price: askPrice, vol: askVol });
            if (parseFloat(askVol) > maxVol) maxVol = parseFloat(askVol);
        }
        for (var j = 1; j <= 10; j++) {
            var bidPrice = basePrice - j * priceStep;
            var bidVolSize = coin.price > 100 ? rand(0.01, 2) : coin.price > 1 ? rand(0.1, 20) : rand(1, 100);
            var bidVol = bidVolSize.toFixed(coin.price > 100 ? 4 : coin.price > 1 ? 4 : 2);
            bids.push({ price: bidPrice, vol: bidVol });
            if (parseFloat(bidVol) > maxVol) maxVol = parseFloat(bidVol);
        }

        var cumAsk = 0;
        asks.forEach(function (a) {
            cumAsk += parseFloat(a.vol);
            var pct = (parseFloat(a.vol) / maxVol * 100).toFixed(0);
            askHtml += '<div class="book-row ask">' +
                '<span class="book-price">' + formatNum(a.price, decimals) + '</span>' +
                '<span>' + a.vol + '</span>' +
                '<span>' + cumAsk.toFixed(4) + '</span>' +
                '<div class="depth-bar" style="width:' + pct + '%"></div>' +
                '</div>';
        });

        var cumBid = 0;
        bids.forEach(function (b) {
            cumBid += parseFloat(b.vol);
            var pct = (parseFloat(b.vol) / maxVol * 100).toFixed(0);
            bidHtml += '<div class="book-row bid">' +
                '<span class="book-price">' + formatNum(b.price, decimals) + '</span>' +
                '<span>' + b.vol + '</span>' +
                '<span>' + cumBid.toFixed(4) + '</span>' +
                '<div class="depth-bar" style="width:' + pct + '%"></div>' +
                '</div>';
        });

        asksEl.innerHTML = askHtml;
        bidsEl.innerHTML = bidHtml;
    }

    function renderRecentTrades() {
        var el = document.getElementById('recent-trades');
        if (!el) return;
        var html = '';
        var coin = getCurrentCoinData();
        var basePrice = coin.price;
        var decimals = coin.price > 100 ? 2 : coin.price > 1 ? 4 : 6;
        var priceRange = basePrice * 0.02;
        for (var i = 0; i < 15; i++) {
            var isBuy = Math.random() > 0.5;
            var price = basePrice + rand(-priceRange, priceRange);
            var amountSize = coin.price > 100 ? rand(0.001, 0.5) : coin.price > 1 ? rand(0.1, 5) : rand(1, 100);
            var amount = amountSize.toFixed(coin.price > 100 ? 4 : coin.price > 1 ? 4 : 2);
            var now = new Date();
            now.setSeconds(now.getSeconds() - i * rand(2, 10));
            var time = now.toTimeString().slice(0, 8);
            html += '<div class="recent-row">' +
                '<span>' + time + '</span>' +
                '<span class="' + (isBuy ? 'price-up' : 'price-down') + '">' + (isBuy ? '买入' : '卖出') + '</span>' +
                '<span class="' + (isBuy ? 'price-up' : 'price-down') + '">' + formatNum(price, decimals) + '</span>' +
                '<span>' + amount + '</span>' +
                '</div>';
        }
        el.innerHTML = html;
    }

    var currentTier = 999;
    var merchantPage = 1;
    var merchantPerPage = 5;

    function initBuy() {
        var buyTabs = document.querySelectorAll('.buy-tab');
        buyTabs.forEach(function (btn) {
            btn.addEventListener('click', function () {
                buyTabs.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var type = btn.getAttribute('data-buy-type');
                var submitBtn = document.getElementById('btn-buy-submit');
                submitBtn.textContent = (type === 'buy' ? '买入' : '卖出') + ' USDT';
                if (type === 'buy') {
                    document.getElementById('buy-tier-group').style.display = '';
                    document.getElementById('sell-amount-group').style.display = 'none';
                    updateBuyReceive();
                } else {
                    document.getElementById('buy-tier-group').style.display = 'none';
                    document.getElementById('sell-amount-group').style.display = '';
                    updateSellReceive();
                }
            });
        });

        var tierBtns = document.querySelectorAll('.tier-btn');
        tierBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                tierBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentTier = parseInt(btn.getAttribute('data-tier'));
                updateBuyReceive();
            });
        });

        document.getElementById('sell-amount-input').addEventListener('input', updateSellReceive);

        var paymentOpts = document.querySelectorAll('.payment-opt');
        paymentOpts.forEach(function (btn) {
            btn.addEventListener('click', function () {
                paymentOpts.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
            });
        });

        function updateBuyReceive() {
            var cnyRate = 7.24;
            var receive = currentTier / cnyRate;
            document.getElementById('buy-receive').value = receive.toFixed(2);
            document.getElementById('buy-rate-val').textContent = '1 USDT ≈ ' + cnyRate.toFixed(2) + ' CNY';
        }

        function updateSellReceive() {
            var input = document.getElementById('sell-amount-input');
            var val = parseFloat(input.value) || 0;
            if (val > 82.60) {
                input.value = 82.60;
                val = 82.60;
            }
            var cnyRate = 7.24;
            document.getElementById('buy-receive').value = (val * cnyRate).toFixed(2);
            document.getElementById('buy-rate-val').textContent = '1 USDT ≈ ' + cnyRate.toFixed(2) + ' CNY';
        }

        document.getElementById('btn-buy-submit').addEventListener('click', function () {
            var type = document.querySelector('.buy-tab.active').getAttribute('data-buy-type');
            if (type === 'sell') {
                var val = parseFloat(document.getElementById('sell-amount-input').value) || 0;
                if (val <= 0) {
                    showToast('请输入卖出数量', 'oops');
                    return;
                }
                if (val > 82.60) {
                    showToast('超出可用余额', 'oops');
                    return;
                }
            }
            openBuyModal();
        });

        initBuyModal();
        updateBuyReceive();
        renderMerchants();

        document.getElementById('merchant-prev').addEventListener('click', function () {
            if (merchantPage > 1) {
                merchantPage--;
                renderMerchants();
            }
        });
        document.getElementById('merchant-next').addEventListener('click', function () {
            var totalPages = Math.ceil(getMerchants().length / merchantPerPage);
            if (merchantPage < totalPages) {
                merchantPage++;
                renderMerchants();
            }
        });
    }

    function getMerchants() {
        return [
            { name: 'XT官方商家', orders: '12,456', rate: '99.8%', price: '7.22' },
            { name: '币安P2P商家', orders: '8,923', rate: '99.5%', price: '7.23' },
            { name: 'OKX认证商家', orders: '6,789', rate: '99.2%', price: '7.24' },
            { name: '火币优选商家', orders: '5,432', rate: '98.9%', price: '7.25' },
            { name: 'Bitget商家', orders: '4,321', rate: '99.1%', price: '7.22' },
            { name: 'Bybit商家', orders: '3,876', rate: '98.7%', price: '7.26' },
            { name: 'Gate.io商家', orders: '3,210', rate: '98.5%', price: '7.23' },
            { name: 'KuCoin商家', orders: '2,987', rate: '98.3%', price: '7.24' },
            { name: 'MEXC商家', orders: '2,654', rate: '98.1%', price: '7.25' },
            { name: 'Bitfinex商家', orders: '2,432', rate: '97.9%', price: '7.22' },
            { name: 'Kraken商家', orders: '2,198', rate: '97.8%', price: '7.27' },
            { name: 'Coinbase商家', orders: '1,987', rate: '97.6%', price: '7.28' },
            { name: 'Crypto.com商家', orders: '1,876', rate: '97.5%', price: '7.23' },
            { name: 'Poloniex商家', orders: '1,654', rate: '97.3%', price: '7.24' },
            { name: 'Bitstamp商家', orders: '1,432', rate: '97.1%', price: '7.26' },
            { name: 'Gemini商家', orders: '1,298', rate: '96.9%', price: '7.25' }
        ];
    }

    function renderMerchants() {
        var el = document.getElementById('merchant-list');
        if (!el) return;
        var merchants = getMerchants();
        var totalPages = Math.ceil(merchants.length / merchantPerPage);
        if (merchantPage > totalPages) merchantPage = totalPages;
        var start = (merchantPage - 1) * merchantPerPage;
        var pageData = merchants.slice(start, start + merchantPerPage);

        var html = '';
        pageData.forEach(function (m) {
            html += '<div class="merchant-card">' +
                '<div class="merchant-top"><span class="merchant-name">' + m.name + '</span><span class="merchant-badge">认证</span></div>' +
                '<div class="merchant-info"><span>成交 ' + m.orders + ' | 好评 ' + m.rate + '</span><span class="merchant-price">¥' + m.price + '/USDT</span></div>' +
                '</div>';
        });
        el.innerHTML = html;
        document.getElementById('merchant-page-info').textContent = '第 ' + merchantPage + ' / ' + totalPages + ' 页';
    }

    function initRecords() {
        var records = [
            {
                time: new Date(2026, 4, 25, 14, 4, 37),
                type: 'buy',
                coin: 'USDT',
                amount: 82.60,
                price: 1.00,
                total: 82.60,
                status: 'completed'
            }
        ];
        var currentPage = 1;
        var perPage = 8;
        var currentFilter = 'all';

        function renderRecords() {
            var tbody = document.getElementById('records-tbody');
            if (!tbody) return;

            var filtered = currentFilter === 'all' ? records : records.filter(function (r) { return r.type === currentFilter; });
            var totalPages = Math.ceil(filtered.length / perPage) || 1;
            if (currentPage > totalPages) currentPage = totalPages;
            var start = (currentPage - 1) * perPage;
            var pageData = filtered.slice(start, start + perPage);

            var typeLabels = { buy: '买入', sell: '卖出', deposit: '充值', withdraw: '提现' };
            var statusLabels = { completed: '已完成', pending: '处理中', cancelled: '已取消' };

            var html = '';
            pageData.forEach(function (r) {
                html += '<tr>' +
                    '<td>' + r.time.toLocaleString('zh-CN') + '</td>' +
                    '<td><span class="type-badge type-' + r.type + '">' + typeLabels[r.type] + '</span></td>' +
                    '<td>' + r.coin + '</td>' +
                    '<td>' + r.amount.toFixed(2) + '</td>' +
                    '<td>' + formatNum(r.price, 2) + '</td>' +
                    '<td>' + formatNum(r.total, 2) + '</td>' +
                    '<td><span class="status-badge status-' + r.status + '">' + statusLabels[r.status] + '</span></td>' +
                    '<td><button class="action-link oops-btn">详情</button></td>' +
                    '</tr>';
            });
            tbody.innerHTML = html;
            document.getElementById('page-info').textContent = '第 ' + currentPage + ' / ' + totalPages + ' 页';
            initOopsButtons();
        }

        document.querySelectorAll('.filter-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                currentFilter = btn.getAttribute('data-filter');
                currentPage = 1;
                renderRecords();
            });
        });

        document.getElementById('prev-page').addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                renderRecords();
            }
        });
        document.getElementById('next-page').addEventListener('click', function () {
            var filtered = currentFilter === 'all' ? records : records.filter(function (r) { return r.type === currentFilter; });
            var totalPages = Math.ceil(filtered.length / perPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderRecords();
            }
        });

        renderRecords();
    }

    function initAccount() {
        var assets = [
            { coin: 'USDT', available: 82.60, frozen: 0 }
        ];

        document.getElementById('assets-total').textContent = '82.60 USDT';
        document.querySelector('.assets-change').textContent = '≈ ¥598.02';

        var tbody = document.getElementById('assets-tbody');
        if (tbody) {
            var html = '';
            assets.forEach(function (a) {
                var total = a.available + a.frozen;
                html += '<tr>' +
                    '<td><div class="coin-cell"><div class="coin-icon" style="background:' + getCoinColor(a.coin) + '">' + a.coin.charAt(0) + '</div><span class="coin-name">' + a.coin + '</span></div></td>' +
                    '<td>' + a.available.toFixed(2) + '</td>' +
                    '<td>' + a.frozen.toFixed(2) + '</td>' +
                    '<td>' + formatNum(total, 2) + ' USDT</td>' +
                    '<td><button class="action-link trade-link" data-coin="' + a.coin + '">交易</button></td>' +
                    '</tr>';
            });
            tbody.innerHTML = html;
            tbody.querySelectorAll('.trade-link').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    switchPage('trade');
                });
            });
        }

        document.getElementById('btn-deposit').addEventListener('click', function () {
            document.getElementById('deposit-modal').style.display = 'flex';
        });
        document.getElementById('modal-close-deposit').addEventListener('click', function () {
            document.getElementById('deposit-modal').style.display = 'none';
        });
        document.getElementById('deposit-modal').querySelector('.modal-overlay').addEventListener('click', function () {
            document.getElementById('deposit-modal').style.display = 'none';
        });

        document.getElementById('btn-copy-addr').addEventListener('click', function () {
            var addr = document.getElementById('deposit-addr').textContent;
            if (navigator.clipboard) {
                navigator.clipboard.writeText(addr).then(function () {
                    showToast('地址已复制到剪贴板', 'success');
                });
            } else {
                showToast('地址已复制到剪贴板', 'success');
            }
        });

        document.getElementById('btn-withdraw').addEventListener('click', function () {
            document.getElementById('withdraw-modal').style.display = 'flex';
        });
        document.getElementById('modal-close-withdraw').addEventListener('click', function () {
            document.getElementById('withdraw-modal').style.display = 'none';
        });
        document.getElementById('withdraw-modal').querySelector('.modal-overlay').addEventListener('click', function () {
            document.getElementById('withdraw-modal').style.display = 'none';
        });
    }

    function getCoinColor(symbol) {
        var coin = COINS.find(function (c) { return c.symbol === symbol; });
        return coin ? coin.color : '#848E9C';
    }

    function initSearch() {
        var input = document.getElementById('search-input');
        if (!input) return;
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                var val = input.value.trim().toUpperCase();
                if (!val) return;
                var found = COINS.find(function (c) {
                    return c.symbol === val || c.name.toUpperCase() === val;
                });
                if (found) {
                    switchPage('market');
                    showToast('已找到 ' + found.symbol + '/' + found.pair, 'success');
                } else {
                    showToast('未找到币种: ' + val, 'oops');
                }
                input.value = '';
            }
        });
    }

    function initLogout() {
        document.getElementById('btn-logout').addEventListener('click', function () {
            document.getElementById('app').style.display = 'none';
            document.getElementById('login-page').style.display = 'flex';
            showToast('已退出登录', 'success');
        });
    }

    function initBuyModal() {
        document.getElementById('modal-close-buy').addEventListener('click', closeBuyModal);
        document.getElementById('buy-modal').querySelector('.modal-overlay').addEventListener('click', closeBuyModal);
    }

    function openBuyModal() {
        var modal = document.getElementById('buy-modal');
        document.getElementById('buy-modal-title').textContent = '选择商家';
        document.getElementById('buy-modal-select').style.display = '';
        document.getElementById('buy-modal-chat').style.display = 'none';
        renderMerchantSelectList();
        modal.style.display = 'flex';
    }

    function closeBuyModal() {
        document.getElementById('buy-modal').style.display = 'none';
    }

    function renderMerchantSelectList() {
        var el = document.getElementById('merchant-select-list');
        var merchants = getMerchants();
        var html = '';
        merchants.forEach(function (m, i) {
            html += '<div class="merchant-select-item" data-index="' + i + '">' +
                '<div class="merchant-select-left">' +
                '<div class="merchant-select-avatar">' + m.name.charAt(0) + '</div>' +
                '<div class="merchant-select-info">' +
                '<span class="merchant-select-name">' + m.name + '</span>' +
                '<span class="merchant-select-meta">成交 ' + m.orders + ' | 好评 ' + m.rate + '</span>' +
                '</div></div>' +
                '<span class="merchant-select-price">¥' + m.price + '/USDT</span>' +
                '</div>';
        });
        el.innerHTML = html;

        el.querySelectorAll('.merchant-select-item').forEach(function (item) {
            item.addEventListener('click', function () {
                var idx = parseInt(item.getAttribute('data-index'));
                var merchant = merchants[idx];
                switchToChat(merchant);
            });
        });
    }

    function switchToChat(merchant) {
        showLoading('连接商家...');
        setTimeout(function () {
            hideLoading();
            document.getElementById('buy-modal-title').textContent = '订单聊天';
            document.getElementById('buy-modal-select').style.display = 'none';
            document.getElementById('buy-modal-chat').style.display = 'flex';

            var type = document.querySelector('.buy-tab.active').getAttribute('data-buy-type');
            var typeLabel = type === 'buy' ? '买入' : '卖出';
            var cnyRate = 7.24;
            var amountUSDT, amountCNY;
            if (type === 'buy') {
                amountUSDT = (currentTier / cnyRate).toFixed(2);
                amountCNY = '¥' + currentTier.toLocaleString() + ' CNY';
            } else {
                var sellVal = parseFloat(document.getElementById('sell-amount-input').value) || 0;
                amountUSDT = sellVal.toFixed(2);
                amountCNY = '¥' + (sellVal * cnyRate).toFixed(2) + ' CNY';
            }

            document.getElementById('chat-header').innerHTML =
                '<div class="chat-header-avatar">' + merchant.name.charAt(0) + '</div>' +
                '<div><div class="chat-header-name">' + merchant.name + '</div>' +
                '<div class="chat-header-status">在线</div></div>';

            var messages = document.getElementById('chat-messages');
            var paymentOpt = document.querySelector('.payment-opt.active');
            var paymentLabel = paymentOpt ? paymentOpt.textContent.trim() : '支付宝';
            messages.innerHTML =
                '<div class="chat-order-card">' +
                '<div class="chat-order-card-header">订单信息</div>' +
                '<div class="chat-order-card-body">' +
                '<div class="chat-order-row"><span>类型</span><span>' + typeLabel + ' USDT</span></div>' +
                '<div class="chat-order-row"><span>金额</span><span>' + (type === 'buy' ? amountCNY : amountUSDT + ' USDT') + '</span></div>' +
                '<div class="chat-order-row"><span>获得</span><span>' + (type === 'buy' ? amountUSDT + ' USDT' : amountCNY) + '</span></div>' +
                '<div class="chat-order-row"><span>单价</span><span>¥' + merchant.price + '/USDT</span></div>' +
                '<div class="chat-order-row"><span>支付</span><span>' + paymentLabel + '</span></div>' +
                '</div></div>' +
                '<div class="chat-waiting">' +
                '<div class="chat-waiting-dots"><span></span><span></span><span></span></div>' +
                '等待商家回复...' +
                '</div>';

            messages.scrollTop = messages.scrollHeight;
        }, 2000);
    }

    function initApp() {
        initNavigation();
        initMarket();
        initTrade();
        initBuy();
        initRecords();
        initAccount();
        initSearch();
        initLogout();
        initOopsButtons();
    }

    document.addEventListener('DOMContentLoaded', function () {
        initLogin();
        initOopsButtons();

        window.addEventListener('resize', function () {
            if (document.getElementById('page-trade').classList.contains('active')) {
                drawChart();
            }
        });
    });
})();
