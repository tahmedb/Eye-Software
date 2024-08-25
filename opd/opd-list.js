const { ipcRenderer } = require('electron');

$(document).ready(function() {
    // Fetch OPD list on page load
    ipcRenderer.send('get-opd-list');

    // Handle OPD list data
    ipcRenderer.on('opd-list-data', (event, opdList) => {
        const opdTableBody = $('#opd-list');
        opdTableBody.empty();

        opdList.forEach(opd => {
            const opdRow = `
                <tr>
                    <td>${opd.date}</td>
                    <td>${opd.slip_no}</td>
                    <td>${opd.name}</td>
                    <td>${opd.relation}</td>
                    <td>${opd.age}</td>
                    <td>${opd.gender}</td>
                    <td>${opd.cnic}</td>
                    <td>${opd.contact}</td>
                    <td>${opd.address}</td>
                    <td>${opd.doctor}</td>
                    <td>${opd.referred_to}</td>
                    <td>${opd.remarks}</td>
                    <td>${opd.service}</td>
                    <td>${opd.eye}</td>
                    <td>${opd.qty}</td>
                    <td>${opd.rate}</td>
                    <td>${opd.amount}</td>
                    <td class="actions">
                        <button class="view-btn" data-slip-no="${opd.slip_no}">View</button>
                        <button class="delete-btn" data-slip-no="${opd.slip_no}">Delete</button>
                        <button class="print-btn" data-slip-no="${opd.slip_no}">Print</button>
                    </td>
                </tr>`;
            opdTableBody.append(opdRow);
        });

        // Bind action buttons
        $('.view-btn').click(function() {
            const slipNo = $(this).data('slip-no');
            // Logic to view OPD details
            ipcRenderer.send('view-opd', slipNo);
        });

        $('.delete-btn').click(function() {
            const slipNo = $(this).data('slip-no');
            ipcRenderer.send('delete-opd', slipNo);
        });

        $('.print-btn').click(function() {
            const slipNo = $(this).data('slip-no');
            // Logic to print receipt
            ipcRenderer.send('print-receipt', slipNo);
        });
    });

    ipcRenderer.on('opd-deleted', (event, slipNo) => {
        // Refresh the list after deletion
        ipcRenderer.send('get-opd-list');
    });

    // Add OPD button handler
    $('#add-opd').click(function() {
        // Logic to open a new window for adding OPD
        ipcRenderer.send('open-add-opd-window');
    });

    // Back button handler
    $('#back').click(function() {
        // Logic to go back to the previous page
        window.history.back();
    });
});
