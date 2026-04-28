import { LightningElement, track } from 'lwc';
import createAppointment from '@salesforce/apex/AppointmentService.createAppointment';
import getPatients from '@salesforce/apex/AppointmentService.getPatients';
import getDoctors from '@salesforce/apex/AppointmentService.getDoctors';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AppointmentDashboard extends LightningElement {

    patientOptions = [];
    doctorOptions = [];

    @track isModalOpen = false;

    patientId = '';
    doctorId = '';
    date = '';
    status = 'Pending';

    statusOptions = [
        { label: 'Pending', value: 'Pending' },
        { label: 'Confirmed', value: 'Confirmed' }
    ];

    connectedCallback() {
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
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handlePatient(event) {
        this.patientId = event.detail.value;
    }

    handleDoctor(event) {
        this.doctorId = event.detail.value;
    }

    handleDate(event) {
        this.date = event.target.value;
    }

    handleStatus(event) {
        this.status = event.detail.value;
    }

    saveAppointment() {

        // 🔥 VALIDATION
        if (!this.patientId || !this.doctorId || !this.date) {
            this.showToast('Error', 'Please fill all fields', 'error');
            return;
        }

        createAppointment({
            patientId: this.patientId,
            doctorId: this.doctorId,
            appointmentDate: this.date,
            status: this.status
        })
        .then(() => {

            this.showToast('Success', 'Appointment Created!', 'success');

            // reset
            this.patientId = '';
            this.doctorId = '';
            this.date = '';
            this.status = 'Pending';

            this.closeModal();

        })
        .catch(error => {
            console.error(error);
            this.showToast('Error', 'Something went wrong', 'error');
        });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({ title, message, variant })
        );
    }
}