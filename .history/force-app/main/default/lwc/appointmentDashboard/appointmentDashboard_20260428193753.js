import { LightningElement, track } from 'lwc';
import createAppointment from '@salesforce/apex/AppointmentService.createAppointment';
import getPatients from '@salesforce/apex/AppointmentService.getPatients';
import getDoctors from '@salesforce/apex/AppointmentService.getDoctors';
import getAppointments from '@salesforce/apex/AppointmentService.getAppointments';
import deleteAppointment from '@salesforce/apex/AppointmentService.deleteAppointment';


export default class AppointmentDashboard extends LightningElement {

    patientOptions = [];
    doctorOptions = [];

    appointments = [];
    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Date', fieldName: 'Date__c', type: 'date' },
        { label: 'Doctor', fieldName: 'DoctorName' },
        { label: 'Patient', fieldName: 'PatientName' },
        /*
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    { label: 'Delete', name: 'delete' }
                ]
            }
        }
        */ 
        {
            type: 'button-icon',
            fixedWidth: 60,
            typeAttributes: {
                iconName: 'utility:delete',
                name: 'delete',
                title: 'Delete',
                variant: 'bare',
                alternativeText: 'Delete'
            }
        }
    ];

    searchKey = '';
    filterStatus = 'All';

    @track isModalOpen = false;

    patientId = '';
    doctorId = '';
    date = '';
    status = 'Pending';

    statusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Confirmed', value: 'Confirmed' }
    ];
    statusFilterOptions = [
        { label: 'All', value: 'All' },
        { label: 'Pending', value: 'Pending' },
        { label: 'Confirmed', value: 'Confirmed' }
    ];

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handlePatient(event) {
        this.patientId = event.target.value;
    }

    handleDoctor(event) {
        this.doctorId = event.target.value;
    }

    handleDate(event) {
        this.date = event.target.value;
    }

    handleStatus(event) {
        this.status = event.target.value;
    }

handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    if (actionName === 'delete') {
        deleteAppointment({ appointmentId: row.Id })
            .then(() => {
                this.appointments = this.appointments.filter(item => item.Id !== row.Id);
            })
            .catch(error => {
                console.error(error);
            });
    }
}

    saveAppointment() {
        createAppointment({
            patientId: this.patientId,
            doctorId: this.doctorId,
            appointmentDate: this.date,
            status: this.status
        })
        .then(() => {
            this.closeModal();
            location.reload(); // quick refresh
        })
        .catch(error => {
            console.error(error);
        });
    }

    get totalAppointments() {
    return this.appointments?.length || 0;
}

get pendingAppointments() {
    return this.appointments?.filter(a => a.Status__c === 'Pending').length || 0;
}

get confirmedAppointments() {
    return this.appointments?.filter(a => a.Status__c === 'Confirmed').length || 0;
}

get filteredAppointments() {
    let data = this.appointments || [];

    // 🔍 search filter
    if (this.searchKey) {
        data = data.filter(item =>
            (item.Name && item.Name.toLowerCase().includes(this.searchKey.toLowerCase())) ||
            (item.DoctorName && item.DoctorName.toLowerCase().includes(this.searchKey.toLowerCase()))
        );
    }

    // 🎯 status filter
    if (this.filterStatus !== 'All') {
        data = data.filter(item => item.Status__c === this.filterStatus);
    }

    return data;
}

handleSearch(event) {
    this.searchKey = event.target.value;
}

handleFilter(event) {
    this.filterStatus = event.target.value;
}


    connectedCallback() {
    // Existing calls
    getPatients().then(data => {
        this.patientOptions = data.map(item => ({
            label: item.Name,
            value: item.Id
        }));
    });

    getDoctors().then(data => {
        this.doctorOptions = data.map(item => ({
            label: item.Name,
            value: item.Id
        }));
    });

    // NEW: Fetch appointments
    getAppointments()
        .then(data => {
            this.appointments = data.map(item => ({
                ...item,
                DoctorName: item.Doctor__r ? item.Doctor__r.Name : '',
                PatientName: item.Patinet__r ? item.Patinet__r.Name : ''
            }));
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
    }
}