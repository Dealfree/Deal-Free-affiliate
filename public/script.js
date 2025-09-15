// ===== Load Users and Ads from localStorage or initialize =====
let users = JSON.parse(localStorage.getItem('users')) || [
    {name:"sozip", email:"fase19op@gmail.com", password:"fahad0325", easypaisa:"1234567890", code:"ADMIN01", isAdmin:true, notifications:[], ad:null}
];

let ads = JSON.parse(localStorage.getItem('ads')) || [
    {link:"https://deal.free.nf/product/premium-comfort-fit-wireless-earbuds/", desc:"Experience high-quality comfort and durability with these premium earbuds, crafted from Plastic, Silicone, and TP for a secure and comfortable fit. Perfect for everyday use, these earbuds are lightweight, stylish, and designed to deliver an enjoyable listening experience. Each package includes 1 x Earbuds, and a user manual to guide you through proper usage and safety precautions. Product Code: MZ63320014GSHE"},
    {link:"https://deal.free.nf/product/premium-mens-100ml-perfume-long-lasting-24h-fragrance/", desc:"Discover the ultimate scent experience with our Premium Men’s Perfume (100ML). Specially designed for men, this fragrance lasts up to 24 hours, ensuring you stay fresh and confident throughout the day. Its amazing scent makes it an excellent choice for daily use, parties, or even as a thoughtful gift for someone special. Product Code: MZ94920035DISRML"}
];

let currentUser = null;

// ===== Helper Function =====
function generateCode() {
    return 'DF' + Math.floor(1000 + Math.random()*9000);
}

// ===== Sign-up Function =====
function signup() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let easypaisa = document.getElementById('easypaisa').value;

    if(!name || !email || !password || !easypaisa) {
        alert("All fields are required!");
        return;
    }

    if(users.some(u => u.email === email)) {
        alert("Email already registered!");
        return;
    }

    let code = generateCode();
    let assignedAd = ads[Math.floor(Math.random()*ads.length)];
    let newUser = {name,email,password,easypaisa,code,isAdmin:false, notifications:[], ad:assignedAd};
    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users)); // persist new user

    alert("Sign-up successful! Your code: "+code);
    window.location.href = "index.html";
}

// ===== Login Function =====
function login() {
    users = JSON.parse(localStorage.getItem('users')) || users; // refresh users
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    let user = users.find(u => u.email === email && u.password === password);
    if(!user) {
        alert("Invalid credentials!");
        return;
    }

    currentUser = user;
    localStorage.setItem('currentUserEmail', user.email); // store current user
    window.location.href = "dashboard.html";
}

// ===== Load Dashboard =====
function loadDashboard() {
    users = JSON.parse(localStorage.getItem('users')) || users;
    ads = JSON.parse(localStorage.getItem('ads')) || ads;
    let email = localStorage.getItem('currentUserEmail');
    currentUser = users.find(u => u.email === email);

    if(!currentUser) { 
        window.location.href="index.html"; 
        return; 
    }

    // Notification Bar
    let notifDiv = document.getElementById('notifications');
    notifDiv.innerHTML = '';
    currentUser.notifications.forEach(msg => {
        let div = document.createElement('div');
        div.className = "notification";
        div.innerText = msg;
        notifDiv.appendChild(div);
    });

    // User Code
    document.getElementById('userCode').innerText = currentUser.code;

    // Ads Section
    let adsDiv = document.getElementById('ads');
    adsDiv.innerHTML = '';

    // Featured ad
    if(currentUser.ad){
        let div = document.createElement('div');
        div.className = "ads-item featured";
        div.innerHTML = `<strong>Featured Ad:</strong><br><a href="${currentUser.ad.link}" target="_blank">${currentUser.ad.link}</a><p>${currentUser.ad.desc}</p>`;
        adsDiv.appendChild(div);
    }

    // Show all ads
    ads.forEach(ad => {
        if(currentUser.ad && ad.link === currentUser.ad.link) return; // skip featured
        let div = document.createElement('div');
        div.className = "ads-item";
        div.innerHTML = `<a href="${ad.link}" target="_blank">${ad.link}</a><p>${ad.desc}</p>`;
        adsDiv.appendChild(div);
    });

    // Admin Panel
    if(currentUser.isAdmin){
        document.getElementById('adminTab').style.display = 'block';
        loadAdminData();
        loadExistingAds();
    }
}

// ===== Admin: Load All Users =====
function loadAdminData(){
    let adminDiv = document.getElementById('adminData');
    adminDiv.innerHTML = '<h3>All Users</h3>';
    users.forEach(u=>{
        let div = document.createElement('div');
        div.className = "ads-item";
        div.innerHTML = `Name: ${u.name} | Email: ${u.email} | Easypaisa: ${u.easypaisa} | Code: ${u.code} | Admin: ${u.isAdmin}`;
        adminDiv.appendChild(div);
    });
}

// ===== Admin: Send Notification =====
function sendNotification(){
    let targetEmail = document.getElementById('targetEmail').value;
    let msg = document.getElementById('message').value;
    if(!targetEmail || !msg) { alert("Fill both fields"); return; }

    let user = users.find(u => u.email === targetEmail);
    if(!user){ alert("User not found"); return; }

    user.notifications.push(msg);
    localStorage.setItem('users', JSON.stringify(users)); // persist notifications
    alert("Notification sent!");
}

// ===== Admin: Load Existing Ads =====
function loadExistingAds(){
    let adsDiv = document.getElementById('existingAds');
    adsDiv.innerHTML = '';
    ads.forEach((ad,index)=>{
        let div = document.createElement('div');
        div.className = "ads-item";
        div.innerHTML = `<a href="${ad.link}" target="_blank">${ad.link}</a>
                         <p>${ad.desc}</p>
                         <button onclick="removeAd(${index})">Remove</button>`;
        adsDiv.appendChild(div);
    });
}

// ===== Admin: Add New Ad =====
function addAd(){
    let link = document.getElementById('newAdLink').value;
    let desc = document.getElementById('newAdDesc').value;
    if(!link || !desc){ alert("Both fields required"); return; }

    ads.push({link,desc});
    localStorage.setItem('ads', JSON.stringify(ads)); // persist ads
    document.getElementById('newAdLink').value = '';
    document.getElementById('newAdDesc').value = '';
    loadExistingAds();
    alert("Ad added successfully!");
}

// ===== Admin: Remove Ad =====
function removeAd(index){
    if(confirm("Are you sure to remove this ad?")){
        ads.splice(index,1);
        localStorage.setItem('ads', JSON.stringify(ads)); // persist
        loadExistingAds();
    }
}

// ===== Logout =====
function logout(){
    localStorage.removeItem('currentUserEmail');
    window.location.href="index.html";
}
