import { LightningElement, track } from 'lwc';
import createAppointment from '@salesforce/apex/AppointmentService.createAppointment';
import getPatients from '@salesforce/apex/AppointmentService.getPatients';
import getDoctors from '@salesforce/apex/AppointmentService.getDoctors';
import getAppointments from '@salesforce/apex/AppointmentService.getAppointments';
import deleteAppointment from '@salesforce/apex/AppointmentService.deleteAppointment';
import updateAppointment from '@salesforce/apex/AppointmentService.updateAppointment';



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
                iconName: 'utility:edit',
                name: 'edit',
                title: 'Edit',
                variant: 'bare',
                alternativeText: 'Edit'
            }
        },
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
    editRecordId = null;

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

    this.patientId = null;
    this.doctorId = null;
    this.date = null;
    this.status = null;

    this.editRecordId = null;
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

updateLocalList() {
    this.appointments = this.appointments.map(item => {
        if (item.Id === this.editRecordId) {
            return {
                ...item,
                Patinet__c: this.patientId,
                Doctor__c: this.doctorId,
                Date__c: this.date,
                Status__c: this.status,
                DoctorName: this.getDoctorName(this.doctorId),
                PatientName: this.getPatientName(this.patientId)
            };
        }
        return item;
    });

    this.appointments = [...this.appointments]; // 🔥 force re-render
}

handleRowAction(event) {
    const actionName = event.detail.action.name;
    const row = event.detail.row;

    if (actionName === 'delete') {
        this.deleteAppointment(row.Id);
    }

    if (actionName === 'edit') {
        this.openEditModal(row);
    }
}
openEditModal(row) {
    this.isModalOpen = true;

    this.editRecordId = row.Id;

    this.patientId = row.Patinet__c || null;  
    this.doctorId = row.Doctor__c || null;   

    this.date = row.Date__c;
    this.status = row.Status__c;
}

saveAppointment() {
    const fixedDate = this.date;

    if (this.editRecordId) {

        updateAppointment({
            recordId: this.editRecordId,
            patientId: this.patientId,
            doctorId: this.doctorId,
            dateValue: fixedDate,   
            status: this.status
        })
        .then(() => {
            this.updateLocalList();
            this.closeModal();
            // this.fetchAppointments();
        })
        .catch(error => console.error(error));

    } else {

        createAppointment({
            patientId: this.patientId,
            doctorId: this.doctorId,
            appointmentDate: fixedDate, 
            status: this.status
        })
        .then(() => {
            this.closeModal();
            this.fetchAppointments();
        })
        .catch(error => console.error(error));
    }
}

fetchAppointments() {
    getAppointments()
        .then(data => {
            const updated = data.map(item => ({
                ...item,
                DoctorName: item.Doctor__r ? item.Doctor__r.Name : '',
                PatientName: item.Patinet__r ? item.Patinet__r.Name : ''
            }));

            this.appointments = [...updated];  // 🔥 FORCE REACTIVITY
        })
        .catch(error => {
            console.error('Error fetching appointments:', error);
        });
}

deleteAppointment(recordId) {
    deleteAppointment({ appointmentId: recordId })
        .then(() => {
            this.appointments = this.appointments.filter(
                item => item.Id !== recordId
            );

            this.appointments = [...this.appointments];
        })
        .catch(error => console.error('Delete error:', error));
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

getDoctorName(id) {
    const doc = this.doctorOptions.find(d => d.value === id);
    return doc ? doc.label : '';
}

getPatientName(id) {
    const pat = this.patientOptions.find(p => p.value === id);
    return pat ? pat.label : '';
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

    this.fetchAppointments();
        
    }
}