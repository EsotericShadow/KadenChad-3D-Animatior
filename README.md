# Portfolio Website Documentation

Hey Kaden!  
This guide will walk you through updating your portfolio website, which is hosted in a private GitHub repository and deployed on Vercel. We’ll keep it super simple: you’ll set up GitHub, upload your changes using drag-and-drop in GitHub’s browser app, deploy them on Vercel (which is a breeze), and connect your custom domain if needed. You’ll also learn how to edit the CSS in `styles.css` and the HTML content in `script.js` to tweak colors, text, images, and more. If you run into any issues, just let me know, and we’ll hop on a video call to fix it together!

---

## Before You Begin

**Backup Files:**  
Always save a copy of your original files before editing (you will do this automatically, because you’ll be editing in GitHub’s browser app and not editing the folder you download via the green ```"<code>"``` button above).

**Tools You’ll Need:**
- A GitHub account (sign up at [github.com](https://github.com)).
- A Vercel account (sign up at [vercel.com](https://vercel.com)).
- Your custom domain (e.g., kadenchad.com).
- Your portfolio’s public folder with files like `index.html`, `script.js`, and `styles.css`.

---

## Table of Contents
- [Setting Up GitHub](#setting-up-github)
- [Editing CSS in styles.css](#editing-css-in-stylescss)
- [Editing HTML in script.js](#editing-html-in-scriptjs)
- [Uploading Changes to GitHub](#uploading-changes-to-github)
- [Deploying on Vercel](#deploying-on-vercel)
- [Connecting a Custom Domain](#connecting-a-custom-domain)
- [Troubleshooting](#troubleshooting)

---

## Setting Up GitHub

Your website lives in a private GitHub repository. Let’s get you set up to access and update it.

**Steps:**

**Sign In to GitHub:**
- Go to [github.com](https://github.com) and create an account if you don’t have one.

**Create and Manage Your Repository:**
- Download the zip above.
- Unzip the folder to your computer (e.g., `Documents/portfolio`).
- Click **New** on the GitHub homepage.
- Name it (e.g., `kaden-portfolio`), set it to **Private**, and click **Create repository**.

**Open the Public Folder:**
- Inside the unzipped folder, find the `public` folder. This contains `index.html`, `script.js`, `styles.css`, and the `assets` folder for images.

---

## Editing CSS in styles.css

The `styles.css` file controls your site’s look, like colors, fonts, and layouts. Here’s how to update it.

**Steps:**

**Open styles.css:**
- Navigate to `public/styles.css` in your GitHub Repository.

**Make Changes:**
- Update colors, fonts, or sizes as needed.

**Examples:**

**Change Site Background Color:**
```css
body {
    background: #121212; /* Dark gray */
    color: #ffffff; /* White text */
}
```
Try a dark blue:
```css
background: #1E2A3C;
```
Change text color:
```css
color: #E0E0E0;
```

**Update Navigation Bar Color:**
```css
.nav-bar {
    background: rgba(0, 0, 0, 0.85); /* Semi-transparent black */
}
```
Use a purple tint:
```css
background: rgba(75, 0, 130, 0.85);
```

**Tweak Content Frames (Bio, Reel, Contact):**
```css
.frame {
    background: rgba(0, 0, 0, 0.85); /* Semi-transparent black */
    border: 1px solid rgba(0, 123, 255, 0.3); /* Blue border */
}
```
Change to green:
```css
background: rgba(0, 128, 0, 0.85);
```
Update border:
```css
border: 1px solid rgba(255, 215, 0, 0.3);
```

**Modify Button Colors (Contact Form):**
```css
.contact-form button {
    background: #007bff; /* Blue */
}
.contact-form button:hover {
    background: #0056b3; /* Darker blue */
}
```
Switch to red:
```css
background: #FF0000;
```
Update hover:
```css
background: #CC0000;
```

**Change Font:**
```css
body {
    font-family: 'Montserrat', sans-serif;
}
```
Use a new font:
```css
font-family: 'Roboto', sans-serif;
```
Update the Google Fonts link in `index.html` if needed:
```html
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;600&display=swap" rel="stylesheet">
```

**Tip:**  
Use a color picker for hex codes. Test changes in a browser to ensure they look good.

---

## Editing HTML in script.js

The HTML for your site’s pages (Logo, Home, Bio, Reel, Contact) is created in `script.js`. Here’s how to update text, images, or add/remove elements.

**Steps:**

**Open script.js:**
- Navigate to `public/script.js` in your text editor.

**Find the createContentFrames Function:**
- Search for `createContentFrames` (around line 400). This contains the HTML for each page in `innerHTML` blocks.

**Make Changes:**
- Edit text, image sources, or add/remove elements.
- Be careful to keep quotes (`"`) and backticks (`` ` ``) intact.

**Save the File:**
- Save before uploading to GitHub.

**Examples:**

**Update Logo Page (Image or Alt Text):**
```javascript
logoFrame.innerHTML = `<img src="assets/Character.png" alt="Kaden Chad Logo" class="logo-img">`;
```
Change image:
```javascript
src="assets/NewLogo.png"
```
Update alt text:
```javascript
alt="Kaden Chad 2025 Logo"
```
Note: Place `NewLogo.png` in `public/assets`.

**Edit Home Page (Text, Skills, Profile Pic):**
```javascript
homeFrame.innerHTML = `
    <div class="header-content">
        <div class="header-text">
            <h1>KADEN CHAD</h1>
            <h2>ANIMATING THE FUTURE</h2>
            <p>3D Character Animator</p>
            <div class="skill-badges">
                <div class="badge">Maya</div>
                <div class="badge">Blender</div>
            </div>
        </div>
        <div class="profile-pic-container">
            <img src="assets/profile_picture.png" alt="Kaden Chad" class="profile-pic">
        </div>
    </div>
`;
```
Change name:
```html
<h1>KADEN’S PORTFOLIO</h1>
```
Update tagline:
```html
<h2>CREATING MAGIC</h2>
```
Edit description:
```html
<p>3D Animator & Performer</p>
```
Add a skill:
```html
<div class="badge">ZBrush</div>
```
Remove profile pic:  
Delete the `<div class="profile-pic-container">...</div>` block.  
Update profile pic:
```html
src="assets/NewProfilePic.jpg" alt="Kaden Chad 2025"
```

**Modify Bio Page (Text):**
```javascript
bioFrame.innerHTML = `
    <h2>FROM STAGE TO 3D</h2>
    <p>${this.bioText}</p>
`;
```
Change heading:
```html
<h2>MY STORY</h2>
```
Update bio text in the `PortfolioScene` constructor:
```javascript
this.bioText = `I'm a 3D Animator with a passion for storytelling... [Your new bio here]`;
```
Add a paragraph:
```html
<p>Award-winning animator!</p>
```

**Update Reel Page (Video or Heading):**
```javascript
reelFrame.innerHTML = `
    <h2>ANIMATION REEL</h2>
    <div class="video-container">
        <div class="responsive-video">
            <iframe 
                src="https://player.vimeo.com/video/1071654651?badge=0&autopause=0&player_id=0&app_id=58479" 
                frameborder="0" 
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" 
                title="Kaden Chad CG Animation Demo April 2025"
                allowfullscreen>
            </iframe>
        </div>
    </div>
`;
```
Change heading:
```html
<h2>MY DEMO REEL</h2>
```
Update video:
- Upload your new video to Vimeo and get the embed URL.
- Replace `src`:
```html
src="https://player.vimeo.com/video/NEW_VIDEO_ID?badge=0&autopause=0&player_id=0&app_id=58479"
```
Update title:
```html
title="Kaden Chad Demo 2026"
```

**Edit Contact Page (Heading or Form):**
```javascript
contactFrame.innerHTML = `
    <h2>CONNECT</h2>
    <form id="contact-form" class="contact-form">
        <input type="text" id="name" name="name" placeholder="Your Name">
        <input type="email" id="email" name="email" placeholder="Your Email">
        <textarea rows="5" id="message" name="message" placeholder="Your Message"></textarea>
        <button type="submit" id="send-button">SEND MESSAGE</button>
    </form>
`;
```
Change heading:
```html
<h2>REACH OUT</h2>
```
Update placeholder:
```html
placeholder="Enter Your Name"
```

**Tip:**  
Only edit text or attributes (e.g., `src`, `alt`). Do not change the HTML structure unless you’re sure, as it could break the site. If you want help with this, I got you.

---

## Uploading Changes to GitHub

**Edit Your Files:**
- Update `styles.css`, `script.js`, and add new images to `public/assets`.
- Save all changes by committing them.

**Commit Your Changes:**
- Scroll down to the “Commit changes” section.
- Write a short message like “Updated styles and bio text.”
- Click **Commit changes**.

**Tip:**  
This uploads your changes to the main branch, which triggers Vercel to update your site.

---

## Deploying on Vercel

Vercel deploys your site automatically when you update the GitHub repo—no settings or environment variables needed.

**Steps:**

**Wait a Minute:**
- After committing to GitHub, give Vercel 1–2 minutes to build and deploy.

**Check Your Site:**
- Visit your site’s URL (e.g., `https://www.kadenchad.com`).
- Confirm your updates are live.

**Refresh if Needed:**
- If changes don’t show, try a hard refresh (Ctrl + F5 on Windows, Cmd + Shift + R on Mac).

---

## Connecting a Custom Domain

If you want to use your custom domain (e.g., `kadenchad.com`) instead of the Vercel URL, here’s how. Skip this if it’s already set up.

**Steps:**

**Log In to Vercel:**
- Go to [vercel.com](https://vercel.com), create an account, and sign in.

**Create a New Project from GitHub Repo:**
- Click **New Project** in the Vercel dashboard.
- Select your GitHub repo and click **Deploy**.

**Add Your Domain:**
- In your project’s Vercel dashboard, go to **Settings > Domains**.
- Type your domain (e.g., `kadenchad.com`) and click **Add**.

**Update DNS Settings:**
- Vercel will show DNS records (e.g., A record or CNAME).
- Log in to your domain registrar (e.g., GoDaddy) and add those records.
- Ask me if you need help with this.

**Wait for It to Work:**
- It may take up to 48 hours, but usually connects in minutes.

---

## Troubleshooting

**Changes Not Showing on Vercel:**
- Ensure you committed to the main branch.
- Check the Vercel dashboard for deployment status.

**CSS or HTML Not Updating:**
- Verify you edited the correct file (`styles.css` or `script.js`).
- Check for typos or broken syntax (e.g., missing quotes in `script.js`).
- Clear your browser cache (hard refresh).

**Upload Failed on GitHub:**
- Confirm you dragged the `public` folder to the right spot.
- Check your internet connection.

**Domain Not Working:**
- Verify DNS settings match Vercel’s instructions.
- Wait longer for propagation.

**Stuck Anywhere?**
- Shoot me a message, and we’ll video chat to sort it out.
