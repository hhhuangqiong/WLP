# Export Job

Now we will use [kue](https://github.com/Automattic/kue) to queue and run the export job. It will save the data into the redis and return export the data as csv file in the controller.

## Flow
Here is the general flow on the current export job.
In each export, we will mention the export type and params which are used to map with the config(`app/config/export.js`) and applied with the request sending out to the external service.

{% plantuml %}

Actor User

User -> WLP: export report
WLP -> ExportController: request
ExportController -> ExportTask: create a new export task and start the task
ExportTask -> ExportConfig: get the config
ExportConfig --> ExportTask: return the config
ExportTask --> ExportController: return the job id
ExportController --> WLP: return the job id

ExportTask -> OtherService: send the request to get the data
OtherService --> ExportTask : return the data
ExportTask --> ExportTask: process the data to csv and save into redis

WLP -> ExportController: request progress
ExportController -> ExportTask: get progress by job id
ExportTask --> ExportController: return progress
ExportController --> WLP: return progress
WLP --> User: showing processing status


User -> WLP: click download button
WLP -> ExportController: request to get file by export id(job id)
ExportController -> ExportTask:request to get file
ExportTask --> ExportTask: get csv file from redis by id
ExportTask --> ExportController: return csv file
ExportController --> WLP: return csv file
WLP --> User: file download

{% endplantuml %}

## Development

http://localhost:3100/
Port with 3100 will be the Kue GUI interface, it will show the current jobs lists.
