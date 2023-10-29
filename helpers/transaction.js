
const transactionQuery = (req) =>{
    const { offset = '0', limit = '30', sort = 'name', direction = 'DESC', search='' } = req.query;
    const query = {  }
    return {
        offset: Number(offset),
        direction,
        limit:  Number(limit),
        query,
        sort
    }
}

module.exports = {
    transactionQuery
}