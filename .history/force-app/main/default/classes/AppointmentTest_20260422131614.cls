@isTest
public class AppointmentTest {
    
    @isTest
    static void testAssignDoctor(){
        
        Doctor__c doc = new Doctor__c(Name='Dr Test', Availability__c=true);
        insert doc;

        Patinet__c pat = new Patinet__c(Name='Test Patient');
        insert pat;

        Appointment__c app = new Appointment__c(
            Patinet__c = pat.Id,
            Date__c = Date.today(),
            Status__c = 'Pending'
        );

        insert app;

        Appointment__c result = [SELECT Doctor__c FROM Appointment__c WHERE Id=:app.Id];

        System.assertNotEquals(null, result.Doctor__c);
    }
}