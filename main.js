const { app, BrowserWindow, ipcMain } = require('electron');
const db = require('./database.js')
const path = require('path');
const fs = require('fs');

let win;
let doctorsWindow;
function createWindow() {
    win = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        }
    });

    win.loadFile('index.html');
    win.webContents.openDevTools()
    win.maximize()
}

app.whenReady().then(createWindow);

ipcMain.on('login', (event, credentials) => {
    authenticateUser(credentials.username, credentials.password, (err, user) => {
        if (err) {
            event.reply('login-response', { success: false, message: 'An error occurred' });
        } else if (user) {
            event.reply('login-response', { success: true, message: 'Login successful' });
            // Optionally, load a new window or navigate to a different view
        } else {
            event.reply('login-response', { success: false, message: 'Invalid username or password' });
        }
    });
});


app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});


ipcMain.on('get-opd-list', (event) => {
    db.all('SELECT * FROM opd', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return;
        }
        event.sender.send('opd-list-data', rows);
    });
});

ipcMain.on('get-doctors', (event) => {
    db.all('SELECT * FROM doctors', (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        event.reply('doctors-data', rows);
    });
});

ipcMain.on('navigate', (event, page) => {
    console.log('page',page)
    doctorsWindow = BrowserWindow.getFocusedWindow();
    if (page === 'doctor') {
        doctorsWindow.loadFile('Doctor/doctor.html');
    } else if (page === 'add-doctor') {
        doctorsWindow.loadFile('Doctor/add-doctor.html');
    } else if (page === 'opd') {
        doctorsWindow.loadFile('opd/opd-list.html');
    }
});

ipcMain.on('open-add-doctor-dialog', () => {
    const mainWindow = BrowserWindow.getFocusedWindow();
    const addDoctorWindow = new BrowserWindow({
        parent: mainWindow,
        modal: true,
        width: 400,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        },
    });
    addDoctorWindow.webContents.openDevTools()
    addDoctorWindow.loadFile('Doctor/add-doctor.html');
});

// Handle adding a new doctor to the database
ipcMain.on('add-doctor', (event, doctorData) => {
    const imageDirectory = path.join(__dirname, 'images');

    // Check if the directory exists, if not, create it
    if (!fs.existsSync(imageDirectory)) {
        fs.mkdirSync(imageDirectory, { recursive: true });
    }

    const imagePath = path.join(imageDirectory, `${Date.now()}_${doctorData.imageName}`);

    // Save the image to the directory
    if (doctorData.imagePath) {
        fs.writeFileSync(imagePath, fs.readFileSync(doctorData.imagePath));
    }

    // Insert the new doctor into the database
    const query = `INSERT INTO doctors (name, email, cnic, phone, cell, address, notes, specialization, image_path)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(query, [
        doctorData.name ?? '',
        doctorData.email ?? '',
        doctorData.cnic ?? '',
        doctorData.phone ?? '',
        doctorData.cell ?? '',
        doctorData.address ?? '',
        doctorData.notes ?? '',
        doctorData.specialization ?? '',
        imagePath ?? ''
    ], (err) => {
        doctorsWindow.webContents.send('refresh-doctor-list');
        if (err) {
            console.error(err);
            return;
        }
    });
});

// Handle viewing a doctor's details
ipcMain.on('view-doctor', (event, doctorId) => {
    db.get('SELECT * FROM doctors WHERE id = ?', [doctorId], (err, row) => {
        if (err) {
            console.error(err);
            return;
        }

        const viewDoctorWindow = new BrowserWindow({
            width: 600,
            height: 400,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false,
                webSecurity: false
            },
        });

        viewDoctorWindow.loadFile('Doctor/view-doctor.html');

        viewDoctorWindow.webContents.on('did-finish-load', () => {
            viewDoctorWindow.webContents.send('doctor-details', row);
        });
    });
});

// Handle deleting a doctor
ipcMain.on('delete-doctor', (event, doctorId) => {
    db.run('DELETE FROM doctors WHERE id = ?', [doctorId], (err) => {
        if (err) {
            console.error(err);
            alert('Error deleting doctor')
            return;
        }
        event.reply('doctor-deleted');
    });
});

ipcMain.on('delete-opd', (event, slipNo) => {
    db.run('DELETE FROM opd WHERE slip_no = ?', slipNo, function(err) {
        if (err) {
            console.error(err.message);
            return;
        }
        event.sender.send('opd-deleted', slipNo);
    });
});


