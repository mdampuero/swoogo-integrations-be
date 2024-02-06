
const eventQuery = (req) =>{
    const { offset = '0', limit = '30', sort = 'name', direction = 'DESC', search='' } = req.query;
    const query = { isDelete: false, name: { $regex: '.*'+search+'.*', $options: 'i' } }
    return {
        offset: Number(offset),
        direction,
        limit:  Number(limit),
        query,
        sort
    }
}

module.exports = {
    eventQuery
}