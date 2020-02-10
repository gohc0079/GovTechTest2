Starting mongodb server

1. Install mongo DB
2. go to cmd and cd to mongodb directory
3. at mongodb directory cd mongodb/server/4.2/bin
4. run this command -> mongod.exe --dbpath=\users\user\mongodb\server\4.2\data
5. mongodb server is started.
6. Install mongodb compass GUI and connect to localhost,port 27017, to view the data thats created

Starting node js application

1. After getting codes from github, run npm install
2. type in command npm run dev to start the node js server

Api documentation

1. Creating house hold: POST /households
2. Creating family member and adding to a house hold: POST /familymember/:household_id
3. Get all households with family members : GET /households
4. Get a household : GET /household/:id
5. Update the spouse value of a family member: PUT /familymember/:_id
6. Disbursement awards
   ElderBonus - GET /disbursement?age=50
   BabySunshineGrant - GET / disbursement?age=5
   YOLOGSTGrant - GET/ disbursement?totalincome=100000
   Student Encouragement - GET/ disbursement?age=16&totalincome=150000&occupation=student(assumptions : qualifying members must be a student)
   Family Togetherness - GET /disbursement?age=18&status=married (assumtions: couple in the household must have a spouse and cannot be divorced or single )
