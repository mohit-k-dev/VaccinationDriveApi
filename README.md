# VaccinationDriveApi

### Install: 
yarn install

### Start server:
npm start

### Api end points:
- Home: http://localhost:3000/
- Citizens list: http://localhost:3000/citizens

#### Citizens list Api details
Url: http://localhost:3000/citizens  
Method: GET  
Input paramaters:

```
# Search params
hospitalCode {number} optional
vaccineCode {number} optional
gender {string} optional - allowed: male, female, others
dateRange {string} optional - Search by vaccination date
search {string} optional - Search by user name, phone number and hospital name

# Pagination params
page {string} optional
limit {string} optional - by default limit is 20

# Sorting params
sort {string} optional - Sort by age & date by ascending or descending order
```

Sample Input:
```
hospitalCode:3
vaccineCode:4
gender:male
ageRange:1-60
dateRange:2017-02-22 - 2018-05-10
page:1
limit:20
sort:date:asc
search:2394071024
```

Sample Response:
```{
    "citizens": [
        {
            "_id": "6103f992dde384a52bf8256b",
            "fullName": "Maricela Oconnor",
            "mobileNumber": "2394071024",
            "hospitalName": "Medwin Cares",
            "hospitalCode": 3,
            "gender": "Male",
            "ageGroup": "Middle-aged",
            "vaccineCode": 4,
            "vaccineName": "potassium chloride"
        }
    ],
    "pageNumber": 1,
    "perPageLimit": 20
}
```