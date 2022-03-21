import express from "express";
import path from "path";

const app = express();

// static 폴더 설정(정적파일 경로 설정)
app.use('/public', express.static(path.join(__dirname, 'public')));

// view engine 설정
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

// 특정 페이지에 걸리지않은 모든 url index 로 redirect
app.get('/*', (req, res) => {
  res.redirect('/');
})


const handleListen = () => {
  console.log('🔥 Listening on http://localhost:3000');
}
app.listen(3000, handleListen);