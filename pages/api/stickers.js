import axios from 'axios'
const AirtablePlus = require('airtable-plus')

const mailScenariosTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'apptEEFG5HTfGQE7h',
  tableName: 'Mail Scenarios'
})
const peopleTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'apptEEFG5HTfGQE7h',
  tableName: 'People'
})
const addressesTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_API_KEY,
  baseID: 'apptEEFG5HTfGQE7h',
  tableName: 'Addresses'
})

export default async (req, res) => {
  if (req.method === 'POST') {
    const data = JSON.parse(req.body)
    let address

    // fetch person record
    let personRecord = await peopleTable.read({
      filterByFormula: `{Email} = '${data.email}'`,
      maxRecords: 1
    }).catch(err => console.log(err))

    if (personRecord.length === 0) {
      personRecord = await peopleTable.create({
        'Full Name': data.name,
        'Email': data.email
      })
      address = await addressesTable.create({
        'Street (First Line)': data.addressFirst,
        'Street (Second Line': data.addressSecond,
        'City': data.city,
        'State/Province': data.state,
        'Postal Code': data.zipCode,
        'Country': data.country,
        'Person': [personRecord.id]
      })
    }
    else {
      address = (await addressesTable.read({
        filterByFormula: `{Person ID} = '${personRecord[0].fields['ID']}'`
      }))[0]
    }

    axios.post(`https://hooks.zapier.com/hooks/catch/507705/o2dbufn/`, {
      'test': false,
      'scenarioRecordID': 'recNDwjb7Zr04Szix',
      'receiverAddressRecordID': address.id,
      'missionNotes': 'Requested via hackclub.com'
    })
      .then(r => res.json({ status: 'success' }))
      .catch(err => console.log(err))
  }
}