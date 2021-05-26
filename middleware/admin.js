
module.exports = function (req,res,next){
    //401 means unauthorised
    //403 means forbidden

    if (!req.user.isAdmin) return res.status(403).send('Access denied.');
    next();
}
