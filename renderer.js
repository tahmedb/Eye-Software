const { ipcRenderer } = require('electron');

document.getElementById('add-opd-btn').addEventListener('click', () => {
    ipcRenderer.send('navigate', 'opd');
});

document.getElementById('add-surgery-btn').addEventListener('click', () => {
    ipcRenderer.send('navigate', 'surgery');
});

document.getElementById('add-doctor-btn').addEventListener('click', () => {
    console.log('button clicked')
    ipcRenderer.send('navigate', 'doctor');
});

document.getElementById('reports-btn').addEventListener('click', () => {
    ipcRenderer.send('navigate', 'reports');
});
