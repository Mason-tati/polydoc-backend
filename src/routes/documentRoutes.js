const router = require('express').Router();
const multer = require('multer');
const { requireAuth } = require('../middleware/auth');
const documentController = require('../controllers/documentController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.use(requireAuth);
router.get('/', documentController.list);
router.post('/upload', upload.single('file'), documentController.upload);
router.get('/:id', documentController.getOne);
router.post('/:id/translate', documentController.translate);

module.exports = router;
