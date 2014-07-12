Парсер для адаптированного формата Markdown, который используется на Javascript.ru.

У него есть два режима работы:
  1. Доверенный -- для статей, задач и другого основного материала. Возможны любые теги и т.п.
  2. Безопасный -- для комментариев и другого user-generated content. Большинство тегов HTML можно использовать.
  
# Вставка кода ```js

Блок кода вставляется как в github:

<pre>
```js
alert(1);
```
</pre>

Или:
<pre>
```html
&lt;!DOCTYPE HTML&gt;
&lt;title&gt;Viva la HTML5!&lt;/title&gt;
```
</pre>

Поддерживаемые языки (список может быть расширен):
  - html 
  - js 
  - css 
  - coffee 
  - php 
  - http 
  - java 
  - ruby 
  - scss 
  - sql

## Выполняемый код `//+ run` и другие настройки 

Если хочется, чтобы посетитель мог запустить код -- добавьте первую строку `//+ run`:

<pre>
```js
//+ run
alert(1);
```
</pre>

Можно использовать любой комментарий: `//+ ... `, `/*+ ... */`, `#+ ...` или `<!--+ ... -->`, 
главное чтобы он был *первой строкой* и в начале был *плюс и пробел*.

Этот комментарий не попадёт в итоговый вывод.

Есть два языка, для которых это поддерживается:
  1. `js` - в доверенном режиме через `eval`, в безопасном -- в `iframe` с другого домена.
  2. `html` - в доверенном режиме показ будет в `iframe` с того же домена, в безопасном -- с другого домена.

Прочие настройки:
  - `height=100` -- высота (в пикселях) для `iframe`, в котором будет выполняться пример. Обычно для HTML она вычисляется автоматически по содержимому.
  - `src="my.js"` -- код будет взят из файла `my.js` 
  - `autorun` -- пример будет запущен автоматически по загрузке страницы.
  - `refresh` -- каждый запуск JS-кода будет осуществлён в "чистом" окружении. 
  Этот флаг актуален только для безопасного режима, т.к. обычно `iframe` с другого домена кешируется и используется многократно.
  - `demo` - флаг актуален только для решений задач, он означает, что при нажатии на кнопку "Демо" в условии запустится этот код. 

Пример ниже использует код файла `my.html` и запускает его автоматически:
<pre>
```html
&lt;!--+ src="my.html" autorun --&gt;
```
</pre>

## Выделение в блоке кода `*!*`

Поддерживаются два выделения:

**Блочное выделение** -- несколько строк выделяются полностью. 

Обозначается строками `*!*` в начале и `*/!*` в конце:
<pre>
```js
*!*
function important() {
  alert("Важный блок");
}
*/!*
```
</pre>

Также можно выделить отдельную строку (одну), поставив в конце `*!*`:

<pre>
```js
function important() {
  alert("Важная строка");*!*
}
```
</pre>

**Инлайн-выделение** выделяет фрагмент текста, например важное слово, для этого оно заключается в `*!*...*/!*`:
<pre>
```css
*!*h1*/!* {
  background: pink *!*important*/!*;
}
```
</pre>

В примере выше выделятся `h1` и `important`.
  
## Код в строке &#96;...&#96;

Для вставки кода в строку он оборачивается в обратные кавычки &#96;...&#96;.

Например:
<pre>
Функция `_.partial` делает то же, что и `bind`, но без привязки контекста `this`.
</pre>

Весь HTML внутри таких кавычек автоматически экранируется и оборачивается в `<code>`:
<pre>
Теги &#96;&lt;script&gt;&#96; и &#96;&lt;b&gt;&#96;
-- станет
Теги &lt;code&gt;&amp;lt;script&amp;gt;&lt;/code&gt; и &lt;code&gt;&amp;lt;b&amp;gt;&lt;/code&gt;
</pre>

Обычно это удобно, но если экранирование не нужно -- можно использовать HTML-тег `<code>...</code>` напрямую:

<pre>
Функция &lt;code>reduce&lt;em>Right&lt;/em>&lt;/code>
</pre>

После открывающей и перед закрывающей обратными кавычками &#96; не должно быть пробелов, такой текст не будет отформатирован:
<pre>
От &#96; до &#96;
</pre>

Это позволяет избежать неверных интерпретаций в тексте. 
Если нужно вставить именно саму обратную кавычку, а она воспринимается как код - используйте Unicode-entity: `&#96;`.

# Показ примеров из директории

Для показа примера "вживую" -- он помещается в поддиректорию и из него делается plunk.

Далее возможны следующие варианты:


## `[iframe]` для показа HTML в `<iframe>`

  
Например:
<pre>
[iframe src="cool-stuff"]
</pre>

Покажет пример `cool-stuff/index.html`. 

Параметры:
  - `height=100` -- высота (если автовычисленная не подходит)
  - `link` -- добавить в ифрейм ссылку для открытия в новом окне
  - `play` -- добавить в ифрейм ссылку для открытия в песочнице
  - `zip` -- добавить в ифрейм ссылку на скачивание архива с примером
  
Обычно чистый `[iframe src="..."]` используется для показа "как работает" пример без возможности залезть в код, например как демка для задачи. 

## `[example]` для показа файлов в табах

То же самое, что `[iframe]`, но дополнительно над `<iframe>` с результатом будет лента с табами файлов примера.

Например:
<pre>
[example src="cool-stuff"]
</pre>

# Сравнение `[compare]` 

Для показа списка достоинств/недостатков:

<pre>
[compare]
+ WebSocket'ы дают минимальную задержку в передаче данных
+ WebSocket'ы позволяют непрерывно передавать данные в обе стороны
- Не поддерживаются в IE<10
[/compare]
</pre>

У достоинств в начале должен стоять плюс `+`, у недостатков минус `-`, строки без `±` недопустимы.

# Ссылки `[...]()`

Ссылки можно задавать вместо `<a href="URL">TITLE</a>` вот так:
<pre>
[TITLE](URL)
</pre>

При этом если `URL` -- абсолютный адрес статьи или задачи, то `TITLE` можно не указывать, он подставится автоматически, например:

<pre>
Читайте об этом в главе [](/events)
-- станет (из базы будет получен заголовок)
Читайте об этом в главе <a href="/events">События</a> 
</pre>

Для того, чтобы сослаться на заголовок, у которого есть `[#anchor]`:

<pre>
[TITLE](#anchor)
</pre>

Для показа ссылки без особого заголовка:

<pre>
[http://ya.ru]()
-- станет
<a href="http://ya.ru">http://ya.ru</a>
</pre>


# Отмена форматирования `<pre>`, `[pre]`

Не применяется форматирование в HTML-комментариях `<!-- ... -->` и тегах:
  - `<script>` `<style>` `<object>` `<embed>` `<video>` `<audio>` `<pre>`

Также форматирование не будет применяться, если обернуть секцию в `[pre]...[/pre]`:
<pre>
[pre]
В этом блоке.

Новые строки.

Не переносятся. И вообще, парсер не работает, просто обычный HTML.
[/pre]
</pre>
  
# Заголовки #Header и якоря [#anchor]

Заголовки начинаются с символа решётки `#`, сколько решёток -- такой и уровень.

На любой заголовок можно сделать общесайтовую ссылку, добавив к нему `[#anchor]`, 
где `anchor` -- имя для `<a name="...">`, в который заголовок обёрнут.

Это имя также запоминается в базе и далее в любой другой статье или задаче можно просто использовать ссылку `[читайте тут](#anchor)` 
для отправки посетителя сразу на нужный заголовок.
 
# Жирный и курсив

Как в обычном Markdown:
<pre>
**жирный**
*курсив*
</pre>

Чтобы выделение сработало, после открывающей и перед закрывающей звёздочной не должно быть пробелов. 

В таком тексте выделения не будет:
<pre>
a * b * c
</pre>

# Типографика

Автоматически заменяются:
  - `(c)` `(r)` `(tm)` `(p)` `+-` `->` `<-` на символы `©` `®` `℗` `±` `→` `←`
  - троеточие `...` на один юникодный символ-троеточие `…`
  - одиночный дефис `-` на юникодный символ-аналог `&ndash;`, двойной дефис `--` на длинное тире `&mdash;`
  - смайлы `:)` `:(` и ряд других - на картинки `<img src="файл для смайла">`
  - кавычки `"..."` - на ёлочки `«...»`  

Двойной разрыв строки означает параграф `<p>`. 

# Сочетания клавиш `[key]`

Для красивого отображения сочетаний клавиш используется бб-тег `[key Ctrl+Shift+P]`.

# Библиотеки `[libs]`

Если нужны одна или несколько библиотек -- перечислите их построчно в секции `[libs]`.

Например:
<pre>
[libs]
http://code.jquery.com/jquery-latest.js
http://code.jquery.com/ui/1.10.4/jquery-ui.js
http://code.jquery.com/ui/1.10.4/themes/ui-lightness/jquery-ui.css
[/libs]
</pre>

Все они попадут в `<head>`, CSS будут до скриптов.

Можно перечислить не полные скрипты, а мнемо-имена, сейчас поддерживается только `d3`:

<pre>
[libs]
d3  
[/libs]
--- аналогично
[libs]
http://d3js.org/d3.v3.min.js
[/libs]
</pre>

# Скрипты и стили `[head]`

Скрипты и стили, которые хочется отправить в `<head>`, можно обернуть в `[head]`:

<pre>
[head]
$(function() {
  $('#slider-example').slider();
});
[/head]
</pre>



 



# Неподдерживаемый Markdown

  - Списки (используйте `<ul>`, `<ol>` и `<dl>`)
  - Таблицы (используйте `<table>`)
  