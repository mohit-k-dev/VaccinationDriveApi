const Citizen = require('../models/citizen')
require('../db');

/**
 * List citizen.
 * 
 * Show citizen list, and use search, filter and paginations.
 *  *
 * @param {number} hospitalCode optional
 * @param {number} vaccineCode optional
 * @param {string} gender optional
 * @param {string} dateRange optional
 * @param {string} search optional
 * 
 * @param {string} page optional
 * @param {string} limit optional
 * 
 * @param {string} sort optional
 * 
 * @return {Array} citizens list
 */
module.exports.citizens = async (req, res) => {

    // Filters
    let match = {};
    // Filter by hospitalCode, e.g. hospitalCode: 1
    if (req.query.hospitalCode) {
        match["lastHospitalCode"] = parseInt(req.query.hospitalCode);
    }

    // Filter by vaccineCode, e.g. vaccineCode: 1
    if (req.query.vaccineCode) {
        match["vaccine.code"] = parseInt(req.query.vaccineCode);
    }

    // Filter by gender, e.g. gender: male
    if (req.query.gender) {
        let gender = '';
        switch (req.query.gender.toString().toLowerCase()) {
            case 'male':
                gender = 'M';
                break;

            case 'female':
                gender = 'F';
                break;

            case 'other':
                gender = ')';
                break;

            default:
                gender = '';
        }

        if (gender != '') {
            match["gender"] = gender;
        }
    }

    // Filter by vaccine age range e.g. ageRange: 10-20
    if (req.query.ageRange) {
        let ageRangeArr = req.query.ageRange.split('-');
        let ageRangeStart = parseInt(ageRangeArr[0].trim());
        let ageRangeEnd = parseInt(ageRangeArr[1].trim());

        match["age"] = {
            "$gte": ageRangeStart,
            "$lte": ageRangeEnd
        };
    }

    // Filter by vaccine date range e.g. dateRange: 2017-02-22 - 2015-08-01
    if (req.query.dateRange) {
        let dateRangeArr = req.query.dateRange.split(' - ');
        let dateRangeStart = dateRangeArr[0].trim();
        let dateRangeEnd = dateRangeArr[1].trim();
        
        match["date"] = {
            "$gte": new Date(dateRangeStart+"T00:00:00.000Z"),
            "$lte": new Date(dateRangeEnd+"T00:00:00.000Z")
        };        
    }

    // Search filter, e.g search: Barnett Haney
    if (req.query.search) {
        let searchKeyword = req.query.search.trim();
        match["$or"] = [
            { "fullName": { "$regex": new RegExp('^' + searchKeyword, 'i') } },
            { "hospital.name": { "$regex": new RegExp('^' + searchKeyword, 'i') } },
            { "phoneNo": { "$regex": new RegExp('^' + searchKeyword, 'i') } }
        ];        
    }

    // Pagination
    let limit = 20;
    if (req.query.limit) {
        limit = parseInt(req.query.limit);
    }
    let skip = 0;
    let page = 1;

    if (req.query.page) {
        page = parseInt(req.query.page);

        if (page > 1){
            skip = (page - 1) * limit;
        } else {
            skip = 0;
        }
    }

    let pipeline = [
        { $addFields: { "firstVaccine": { $first: "$vaccinations" } } },
        { $addFields: { "fullName": { $concat: [ "$firstName", " ", "$lastName" ] } } },
        {
            $addFields: {
                "date": {   // Vaccine date
                    "$dateFromString": {
                        "dateString": {
                            $let:{
                                vars:{parts:{$split:["$firstVaccine.date"," "]}},
                                in:{$concat:[
                                    {$arrayElemAt:["$$parts",2]},'-',
                                    {$arrayElemAt:["$$parts",1]} ,'-',
                                    {$arrayElemAt:["$$parts",3]}
                                    ]
                                }
                            }
                        }
                    }
                }
            }
        },

        {
            $lookup: { 
                from: "hospital",
                foreignField: "hospitalCode",
                localField: "lastHospitalCode", 
                as: "hospital"
            }
        },
        {
            $lookup: { 
                from: "vaccinationsData",
                foreignField: "code",
                localField: "firstVaccine.code", 
                as: "vaccine"
            }
        },
        { $unwind: "$vaccine" },
        { $match: match },
        { 
            $project: {
                fullName: 1,
                mobileNumber: "$phoneNo",
                hospitalName: '$hospital.name',
                hospitalCode: '$lastHospitalCode',
                gender: {
                    $switch: {
                        branches: [
                            { case: { $eq: [ "$gender", "M"] }, then: "Male" },
                            { case: { $eq: [ "$gender", "F"] }, then: "Female" }
                        ],
                        default: "Other"
                    }
                },
                ageGroup: {
                    $switch: {
                        branches: [
                            { case: { $and: [ { $gte: [ "$age", 18] }, { $lte: [ "$age", 45] } ] }, then: "Adult" },
                            { case: { $and: [ { $gte: [ "$age", 46] }, { $lte: [ "$age", 60] } ] }, then: "Middle-aged" },
                            { case: { $gte: [ "$age", 61] }, then: "Senior citizen" }
                        ],
                        default: "Child"
                    }
                },
                vaccineCode: '$vaccine.code',
                vaccineName: '$vaccine.name',
                date:1
            } 
        },
        { $unwind: "$hospitalName" },
        { $skip : skip },
        { $limit : limit }
    ];

    // Sorting
    if (req.query.sort) {
        const sortArr = req.query.sort.split(':');
        let sortField = sortArr[0];
        let sortOrder = (sortArr[1] == 'asc') ? 1 : -1;

        let sort = {};
        sort[sortField] = sortOrder;
        sort = {
            "$sort" : sort
        };
        if (sortField == 'date') {
            pipeline.push(sort);
        } else {
            pipeline.unshift(sort);
        }
    }

    const citizens = await Citizen.aggregate(pipeline).allowDiskUse(true);

    res.send({
        citizens,
        pageNumber: page,
        perPageLimit: limit
    });
};

module.exports.greet = async (req, res) => {
    res.send({'message': 'Welcome to vaccination drive'});
}