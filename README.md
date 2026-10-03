# Marius Perrin CRM

A small, beginner-friendly CRM for organizing business prospects. It uses plain HTML, CSS, and JavaScript, so there is no build step or package installation.

## Run the app

Open `index.html` in a web browser. If your browser restricts saved data for local files, run a simple local web server from this folder instead, then open the local address it prints.

## What it does

- Add and edit a company, contact, email, phone number, status, last contact date, client type, product interest, next follow-up date, and notes.
- Search prospects and filter them by status.
- See a quick count of all prospects, active conversations, and clients.
- Delete a prospect after confirming the action.
- Export your prospect list as a CSV file for a spreadsheet.
- Save your data in this browser with `localStorage`. Data is not sent to a server, and it will not automatically appear in a different browser or device.

## Project files

- `index.html` contains the page structure and the prospect form.
- `styles.css` controls the layout, colors, and responsive styling.
- `app.js` handles form actions, searching, filtering, CSV export, and browser storage.

This is a front-end learning project, not a shared or cloud-backed CRM. Avoid storing sensitive customer information in it.
