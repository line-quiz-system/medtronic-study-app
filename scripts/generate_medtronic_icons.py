# -*- coding: utf-8 -*-
from PIL import Image, ImageDraw, ImageFilter
import os

def create_medtronic_icon(size=512):
    # メドトロニックブルーのグラデーション背景
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = int(size * 0.05)
    radius = int(size * 0.22)
    
    # 角丸背景
    # 背景グラデーション
    bg = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg)
    
    # #004B87 (0, 75, 135) to #002554 (0, 37, 84)
    for y in range(size):
        ratio = y / float(size - 1)
        r = int(0 * (1 - ratio) + 0 * ratio)
        g = int(75 * (1 - ratio) + 37 * ratio)
        b = int(135 * (1 - ratio) + 84 * ratio)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
        
    # マスク作成
    mask = Image.new("L", (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=radius, fill=255)
    
    img.paste(bg, (0, 0), mask)
    draw = ImageDraw.Draw(img)

    # 枠線（白＋ライトブルーのグロー）
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=radius,
        outline=(255, 255, 255, 180),
        width=int(size * 0.02)
    )

    # 心電図・メドトロニックハイパワーの波形（シャープなQRS + ペーシングスパイク）
    # 白とシアン（#00A3E0: 0, 163, 224）の鮮やかな波形
    pts = [
        (0.12, 0.52),
        (0.25, 0.52),
        (0.28, 0.52),
        (0.29, 0.38), # Pacing Spike
        (0.30, 0.52),
        (0.34, 0.52),
        (0.37, 0.56), # Q
        (0.44, 0.16), # R (急峻なピーク)
        (0.50, 0.82), # S (深い切れ込み)
        (0.55, 0.52),
        (0.62, 0.52),
        (0.68, 0.40), # T波
        (0.74, 0.40),
        (0.80, 0.52),
        (0.88, 0.52),
    ]

    scaled_pts = [(int(p[0] * size), int(p[1] * size)) for p in pts]

    # グロー効果用の下地波形
    glow = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    for i in range(len(scaled_pts) - 1):
        glow_draw.line([scaled_pts[i], scaled_pts[i+1]], fill=(0, 163, 224, 200), width=int(size * 0.06))
    glow = glow.filter(ImageFilter.GaussianBlur(int(size * 0.03)))
    img.alpha_composite(glow)

    # 本体の白波形
    draw = ImageDraw.Draw(img)
    for i in range(len(scaled_pts) - 1):
        draw.line([scaled_pts[i], scaled_pts[i+1]], fill=(255, 255, 255, 255), width=int(size * 0.035))

    # 「HIGH POWER」のテキスト風デザイン、またはハートアイコン
    # 画面下部に小さくスマートなインジケータ
    dot_radius = int(size * 0.015)
    draw.ellipse([size*0.5 - dot_radius, size*0.82 - dot_radius, size*0.5 + dot_radius, size*0.82 + dot_radius], fill=(0, 163, 224, 255))

    return img

def main():
    icon512 = create_medtronic_icon(512)
    icon192 = icon512.resize((192, 192), Image.Resampling.LANCZOS)
    icon64 = icon512.resize((64, 64), Image.Resampling.LANCZOS)
    icon32 = icon512.resize((32, 32), Image.Resampling.LANCZOS)

    # 保存
    dirs = [".", "public", "gas_app"]
    for d in dirs:
        if not os.path.exists(d):
            os.makedirs(d)
        icon512.save(os.path.join(d, "icon-512.png"))
        icon192.save(os.path.join(d, "icon-192.png"))
        icon192.save(os.path.join(d, "apple-touch-icon.png"))
        icon64.save(os.path.join(d, "favicon.ico"))

    print("アイコン生成完了!")

if __name__ == "__main__":
    main()
