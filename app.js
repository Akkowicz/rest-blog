var bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    mongoose = require('mongoose'),
    express = require('express'),
    app = express();

mongoose.connect('mongodb://localhost/rest_blog_app');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: { type: Date, default: Date.now }
});

var Blog = mongoose.model('Blog', blogSchema);

app.get('/', (req, res) => {
    res.redirect('/blogs');
});

app.get('/blogs', (req, res) => {
    Blog.find({}).sort({ _id: -1 }).exec((err, blogs) => {
        if (err) {
            console.log(err);
        }
        else {
            res.render('index', { blogs: blogs });
        }
    });
});

app.get('/blogs/new', (req, res) => {
    res.render('new');
});

app.post('/blogs', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    var formData = req.body.blog;
    Blog.create(formData, (err, newBlog) => {
        if (err) {
            res.render("new");
        }
        else {
            res.redirect('/blogs');
        }
    });
});

app.get('/blogs/:id', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            res.redirect('/blogs');
        }
        else {
            res.render('show', { blog: foundBlog });
        }
    });
});

app.get('/blogs/:id/edit', (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog) => {
        if (err) {
            console.log(err);
            res.redirect('/blogs');
        }
        else {
            res.render('edit', { blog: foundBlog });
        }
    });
});

app.put('/blogs/:id', (req, res) => {
    req.body.blog.body = req.sanitize(req.body.blog.body);
    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updatedBlog) => {
        if (err) {
            console.log(err);
            res.redirect('/blogs');
        }
        else {
            res.redirect(`/blogs/${req.params.id}`);
        }
    });
});

app.delete('/blogs/:id', (req, res) => {
    Blog.findByIdAndRemove(req.params.id, (err) => {
        if (err) {
            console.log(err);
            res.redirect('/blogs');
        }
        else {
            res.redirect('/blogs');
        }
    });
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log('Blog server is running!');
});
