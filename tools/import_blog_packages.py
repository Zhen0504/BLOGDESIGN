from pathlib import Path
from zipfile import ZipFile
import re, shutil
root = Path(__file__).resolve().parents[1]
packages = [
 ('D:/school/paper/Learn01/JJZ02_260805_01/blog/vsnn-reproduction-blog-20260926.zip', 'vsnn-reproduction', '[论文复现, VSNN, Julia]'),
 ('D:/project/Obsidian_Room/Zhen/Zhen/Inbox/神经网络/手搓神经网络_博客文章包.zip', 'neural-network-from-scratch', '[学习笔记, 神经网络, NumPy, MNIST]'),
]
for path, slug, tags in packages:
    with ZipFile(path) as z:
        main = max((n for n in z.namelist() if n.endswith('.md')), key=lambda n: z.getinfo(n).file_size)
        body = z.read(main).decode('utf-8-sig')
        frontmatter = re.match(r'^---\s*\n(.*?)\n---\s*\n', body, re.S)
        if frontmatter:
            title = re.search(r'^title: (.+)$', frontmatter[1], re.M)[1].strip()
            body = body[frontmatter.end():]
        else:
            title = body.splitlines()[0].lstrip('# ')
            body = body.partition('\n')[2]
        body = re.sub(r'\]\((?:\./)?images/', f'](/blog/{slug}/images/', body)
        body = re.sub(r'\]\((?:\./)?tables/', f'](/blog/{slug}/attachments/', body)
        for name in z.namelist():
            m = re.search(r'/(images|tables)/([^/]+)$', name)
            if m:
                folder = 'images' if m[1] == 'images' else 'attachments'
                dest = root / f'public/blog/{slug}/{folder}' / m[2]
                dest.parent.mkdir(parents=True, exist_ok=True)
                with dest.open('xb') as f: f.write(z.read(name))
        with (root / f'content/research/{slug}.md').open('x', encoding='utf-8') as f:
            f.write(f'---\ntitle: {title}\ndate: 2026-09-27\nsummary: {title}，记录实践过程、实验结果与学习收获。\ntags: {tags}\n---\n{body}')
dest = root / 'public/blog/building-my-blog/images'
dest.mkdir(parents=True, exist_ok=True)
for uid, name in [('62fc164b-eb93-4122-a04b-d3d7d50d711a','blender-wireframe'),('49e8f1d5-648a-4977-b114-b5ea1aefbdb7','blender-material')]:
    shutil.copyfile(f'C:/Users/lenovo/AppData/Local/Temp/codex-clipboard-{uid}.png', dest / f'{name}.png')
