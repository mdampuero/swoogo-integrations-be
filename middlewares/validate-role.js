
const validateAdminRole = async (req = request, res, next) => {

    const { role } = req.user;

    try {
        if (!req.user) 
            throw 'The request is not valid';
        
        if (role !== 'ADMIN_ROLE')
            throw 'The role is not valid';
        
        next();
    } catch (e) {
        return res.status(401).json({
            response: e
        })
    }
}

const existRole = (...roles) => {

    return (req, res, next) => {
        try {
            if (!req.user) 
                throw 'The request is not valid';
            if (!roles.includes(req.user.role)) 
                throw 'The role is not present';   
            next();
        } catch (e) {
            return res.status(401).json({
                response: e
            })
        }
    }
   
}

module.exports = {
    validateAdminRole,
    existRole
}