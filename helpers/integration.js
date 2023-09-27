
const integrationQuery = (req) =>{
    const { offset = '0', limit = '30', sort = 'type', direction = 'DESC', search='' } = req.query;
    const query = { isDelete: false, type: { $regex: '.*'+search+'.*', $options: 'i' } }
    return {
        offset: Number(offset),
        direction,
        limit: Number(limit),
        query,
        sort
    }
}

module.exports = {
    integrationQuery
}