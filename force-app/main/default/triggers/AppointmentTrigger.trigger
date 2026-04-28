trigger AppointmentTrigger on Appointment__c (before insert) {
    if(Trigger.isBefore && Trigger.isInsert){
        AppointmentService.assignDoctor(Trigger.new);
    }
}