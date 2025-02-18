# Okta Housekeeping

Okta is een Identity Provider. Haar functie is om gasten welkom te 
heten en toegangsbeleid te beheren en te handhaven. Okta kan dienen
als toegangsdeur voor portalen en webapplicaties. Vaak kunnen gebruikers
zijn daarvoor zelfstandig registeren en in die gevallen moet er rekening
mee gehouden worden dat ook bots dat doen. In welke mate dat is hangt af
van andere maatregelen, zoals toepassin van captcha's, etc.

Toegangspasjes moeten beheerd worden. Als ze niet meer gebruikt worden
moeten ze ingenomen worden en als aanvraagformulieren niet teruggestuurd
worden, dan moet de aanvraag verwijderd worden. Dit is huishoudelijk werk
en ook Okta heeft huishoudelijk werk nodig is.

Dit eenvoudige raamwerk helpt met het beheren en uitvoeren van huishoudelijke klusjes. Het is zo opgezet dat het gedraaid kan worden
vanuit een prompt/terminal/powershell, uiteraard via node. Het is zo 
ontworpen dat relatief eenvoudig functies aan het raamwerk toegevoegd kunnen worden. 

Op dit moment zijn er functies voor:
- Verwijderen van gebruikers van de 'Email Suppression List' bij de emailprovider van Okta (unblockMailRecipient)
- Oplijsten van de beheerders van de instance, met hun rol (listAdmins)
- Verwijderen van een factor bij gebruikers uit een CSV bestand (unenrollFactor)
- Oplijsten van alle gebruikers in Okta met hun accountstatus (listAllAccounts)
- Oplijsten van alle gedeaxtiveerde gebruikers (listDeactivatedAccounts)
- Oplijsten van alle gebruikers die hun account nog moeten activeren, incluseif de datum waarop die mogelijkheid verloopt (listPendingAccounts)
- Verwijderen van alle gedeactiveerde gebruikers (deleteDeactivatedAccounts)
- Deactiveren van alle gebruikers van wie de mogelijkheid tot activeren van het account is verlopen (deactivateExpiredPendingAccounts)

Toekomstige functies zouden kunnen zijn om een CSV met gebruikers te importeren zodat deze functie gepland geautomatiseerd uitgevoerd kan worden.

Alle feedback in de vorm van lijsten wordt gegeven als kommagescheiden waaden op het scherm die eenvoudig in Excel geplakt kunnen worden. Soms is de feedback alleen dat iets gelukt is of dat er geen fouten waren.

Zorg dat je node.js hebt geinstalleerd voordat je dit script gebruikt. Vervolgens is de werkwijze:
- Open een DOS-prompt, PowerShell of Terminal (Mac)
- Ga naar de directory waar het script zich bevindt
- Type de opdracht in:
````
    node housekeeping prd listAllUsers
````

Sommige functies vereisen parameters die na de functienaam opgegeven moet worden. Dit geeft de functie als feedback als het ontbreekt Voorbeeld van een functie met parameters:
````
    node housekeeping prd unblockEmailRecipient koen.bonnet@cloudguide.nl,koen@goodgrid.nl
````
In het voorbeeld zijn de twee emailadressen een enkele parameter die door de functie gescheiden wordt op basis van de komma.
