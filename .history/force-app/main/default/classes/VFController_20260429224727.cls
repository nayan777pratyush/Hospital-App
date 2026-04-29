public class VFController {
    
    public List<Appointment__c> appointments {get; set;}
    
    public VFController(){
        appointments = [
            SELECT Name, Status__c, Appointment_Date_Time__c, Doctor__c
            FROM Appointment__c
        ];
    }
}