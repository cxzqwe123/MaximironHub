from flask import Flask, render_template, request, redirect, url_for, send_from_directory, jsonify
import os, json
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['THUMB_FOLDER'] = os.path.join(app.config['UPLOAD_FOLDER'], 'thumbs')
app.config['MAX_CONTENT_LENGTH'] = 600 * 1024 * 1024  # 600MB

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(app.config['THUMB_FOLDER'], exist_ok=True)

ALLOWED = {'png', 'jpg', 'jpeg', 'mp4', 'mov', 'webm', 'gif'}
META_FILE = os.path.join(app.config['UPLOAD_FOLDER'], 'metadata.json')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED

def load_meta():
    if os.path.exists(META_FILE):
        try:
            with open(META_FILE, 'r', encoding='utf8') as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def save_meta(meta):
    with open(META_FILE, 'w', encoding='utf8') as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)

@app.route('/')
def index():
    meta = load_meta()
    files = []
    for fn in sorted(os.listdir(app.config['UPLOAD_FOLDER']), reverse=True):
        path = os.path.join(app.config['UPLOAD_FOLDER'], fn)
        if os.path.isdir(path):
            continue
        if allowed_file(fn):
            display = meta.get(fn, {}).get('title') or fn
            thumb = None
            thumb_path = os.path.join(app.config['THUMB_FOLDER'], fn + '.jpg')
            if os.path.exists(thumb_path):
                thumb = 'uploads/thumbs/' + fn + '.jpg'
            files.append({'fn': fn, 'display': display, 'thumb': thumb})
    return render_template('index.html', files=files)

@app.route('/upload', methods=['POST'])
def upload():
    # handle uploaded file and optional thumbnail and custom title
    f = request.files.get('file')
    thumb = request.files.get('thumb')
    title = request.form.get('custom_name','').strip()
    # enforce title required
    if not title:
        return redirect(url_for('index', error=1))
    if not f or f.filename == '':
        return redirect(url_for('index'))
    if allowed_file(f.filename):
        name = secure_filename(f.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], name)
        base, ext = os.path.splitext(name)
        counter = 1
        while os.path.exists(save_path):
            name = f"{base}_{counter}{ext}"
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], name)
            counter += 1
        f.save(save_path)
        # save thumbnail if provided
        if thumb and thumb.filename:
            thumb_name = name + '.jpg'
            thumb.save(os.path.join(app.config['THUMB_FOLDER'], thumb_name))
        # update metadata
        meta = load_meta()
        if title:
            meta[name] = {'title': title}
            save_meta(meta)
    return redirect(url_for('index'))
    if allowed_file(f.filename):
        name = secure_filename(f.filename)
        save_path = os.path.join(app.config['UPLOAD_FOLDER'], name)
        base, ext = os.path.splitext(name)
        counter = 1
        while os.path.exists(save_path):
            name = f"{base}_{counter}{ext}"
            save_path = os.path.join(app.config['UPLOAD_FOLDER'], name)
            counter += 1
        f.save(save_path)
        # save thumbnail if provided
        if thumb and thumb.filename:
            thumb_name = name + '.jpg'
            thumb.save(os.path.join(app.config['THUMB_FOLDER'], thumb_name))
        # update metadata
        meta = load_meta()
        if title:
            meta[name] = {'title': title}
            save_meta(meta)
    return redirect(url_for('index'))

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    host = os.environ.get('FLASK_RUN_HOST', '127.0.0.1')
    port = int(os.environ.get('FLASK_RUN_PORT', 5000))
    print('Starting Maximironhub Neon v2 — http://%s:%d' % (host, port))
    app.run(host=host, port=port, debug=False, use_reloader=False, threaded=False)
