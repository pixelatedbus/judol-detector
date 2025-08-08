const router = require('express').Router();
const passport = require('passport');

const CLIENT_HOME_PAGE_URL = 'http://localhost:3001';

router.get('/google', passport.authenticate('google'));

router.get(
  '/google/redirect',
  passport.authenticate('google', {
    successRedirect: CLIENT_HOME_PAGE_URL, // On success, go back to the frontend
    failureRedirect: `${CLIENT_HOME_PAGE_URL}/www`, // On failure, go to a failure page
  })
);

router.get('/status', (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: 'User is authenticated',
      user: req.user,
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'User is not authenticated',
    });
  }
});

router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.session.destroy();
    res.redirect(CLIENT_HOME_PAGE_URL);
  });
});

module.exports = router;