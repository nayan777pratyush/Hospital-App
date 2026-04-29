import { LightningElement, track } from 'lwc';
import createAppointment from '@salesforce/apex/AppointmentService.createAppointment';
import getPatients from '@salesforce/apex/AppointmentService.getPatients';
import getDoctors from '@salesforce/apex/AppointmentService.getDoctors';
import getAppointments from '@salesforce/apex/AppointmentService.getAppointments';

export default class AppointmentDashboard extends LightningElement {

    patientOptions = [];
    doctorOptions = [];

    appointments = [];
    columns = [
        { label: 'Name', fieldName: 'Name' },
        { label: 'Status', fieldName: 'Status__c' },
        { label: 'Date', fieldName: 'Date__c', type: 'date' },
        { label: 'Doctor', fieldName: 'DoctorName' },
        { label: 'Patient', fieldName: 'PatientName' }
    ];

    @track isModalOpen = false;

    patientId = '';
    doctorId = '';
    date = '';
    status = 'Pending';

    statusOptions = [
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