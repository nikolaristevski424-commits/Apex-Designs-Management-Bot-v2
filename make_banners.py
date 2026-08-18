#!/usr/bin/env python3
import os, math, random
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageOps, ImageChops

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
W, H = 1024, 320
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
LOGO_PATH = os.path.join(SCRIPT_DIR, "assets", "apex_designs_logo.png")

RED=(216,28,42); RED_DARK=(90,8,16); SILVER_LIGHT=(235,235,238)
SILVER_MID=(170,172,176); SILVER_DARK=(70,72,78); BLACK=(5,5,6)
random.seed(7)

def font(size): return ImageFont.truetype(FONT_BOLD, size)

def make_background():
    img = Image.new("RGB",(W,H),BLACK)
    glow=Image.new("L",(W,H),0); gd=ImageDraw.Draw(glow)
    cx,cy=int(W*.92),int(H*1.05); mr=int(W*.55)
    for r in range(mr,0,-4): gd.ellipse([cx-r,cy-r,cx+r,cy+r],fill=int(70*(1-r/mr)))
    glow=glow.filter(ImageFilter.GaussianBlur(40))
    img=Image.composite(Image.new("RGB",(W,H),RED_DARK),img,glow)
    g2=Image.new("L",(W,H),0); g2d=ImageDraw.Draw(g2)
    for r in range(int(W*.35),0,-4): g2d.ellipse([int(W*.08)-r,-r*2,int(W*.08)+r,r*2*2],fill=int(28*(1-r/(W*.35))))
    g2=g2.filter(ImageFilter.GaussianBlur(35))
    img=Image.composite(Image.new("RGB",(W,H),(60,62,66)),img,g2)
    n=Image.new("L",(W,H),0); nd=ImageDraw.Draw(n)
    for _ in range(900):
        y=random.randint(0,H-1); x1=random.randint(0,W-1); l=random.randint(20,140)
        nd.line([(x1,y),(min(W,x1+l),y)],fill=random.randint(2,10))
    n=n.filter(ImageFilter.GaussianBlur(0.4))
    img=Image.composite(Image.new("RGB",(W,H),(255,255,255)),img,n)
    d=ImageDraw.Draw(img)
    d.polygon([(0,H-28),(180,H-28),(230,H),(0,H)],fill=(14,14,15))
    d.line([(0,H-28),(180,H-28),(230,H)],fill=SILVER_DARK,width=2)
    d.polygon([(W,0),(W-170,0),(W-220,26),(W,26)],fill=RED_DARK)
    d.line([(W,26),(W-220,26),(W-170,0)],fill=RED,width=2)
    d.line([(0,H-6),(int(W*.45),H-6)],fill=RED,width=3)
    return img

def measure_w(draw,text,size,spacing):
    f=font(size); total=0
    for ch in text:
        b=draw.textbbox((0,0),ch,font=f); total+=(b[2]-b[0])+spacing
    return max(0,total-spacing)

def metallic_text(draw,img,pos,text,size,spacing=4,top=SILVER_LIGHT,bot=SILVER_DARK):
    f=font(size); x,y=pos
    widths=[draw.textbbox((0,0),ch,font=f)[2]-draw.textbbox((0,0),ch,font=f)[0] for ch in text]
    total_w=sum(widths)+spacing*(len(widths)-1)
    layer=Image.new("RGBA",(total_w+20,size+40),(0,0,0,0)); ld=ImageDraw.Draw(layer)
    cx=0
    for ch,w in zip(text,widths):
        ld.text((cx,0),ch,font=f,fill=(255,255,255,255)); cx+=w+spacing
    mask=layer.split()[3]
    grad=Image.new("RGB",layer.size,bot)
    for yy in range(layer.size[1]):
        t=yy/max(1,layer.size[1]-1)
        r=int(top[0]+(bot[0]-top[0])*t); g=int(top[1]+(bot[1]-top[1])*t); b=int(top[2]+(bot[2]-top[2])*t)
        ImageDraw.Draw(grad).line([(0,yy),(layer.size[0],yy)],fill=(r,g,b))
    col=Image.new("RGBA",layer.size,(0,0,0,0)); col.paste(grad,(0,0),mask)
    sh=Image.new("RGBA",layer.size,(0,0,0,0)); sd=ImageDraw.Draw(sh)
    cx=0
    for ch,w in zip(text,widths):
        sd.text((cx+3,4),ch,font=f,fill=(0,0,0,200)); cx+=w+spacing
    sh=sh.filter(ImageFilter.GaussianBlur(2))
    img.paste(sh,(int(x),int(y)),sh); img.paste(col,(int(x),int(y)),col)
    return total_w

def add_logo(img,h=190,x=46):
    logo=Image.open(LOGO_PATH).convert("RGBA")
    ratio=h/logo.height; logo=logo.resize((int(logo.width*ratio),h))
    pos=(x,(H-h)//2-6); img.paste(logo,pos,logo); return logo,pos

def save(img,name):
    p=os.path.join(SCRIPT_DIR,"banners",name); img.save(p,quality=95); print("saved",name)

def build_side_banner(name,title,subtitle,logo_h=190):
    img=make_background().convert("RGBA"); d=ImageDraw.Draw(img)
    logo,(lx,ly)=add_logo(img,logo_h)
    tx=lx+logo.width+38; mw=W-60-tx
    sz=58; sp=4
    while sz>30 and measure_w(d,title,sz,sp)>mw: sz-=2
    metallic_text(d,img,(tx,H//2-64),title,sz,sp)
    metallic_text(d,img,(tx,H//2+18),subtitle,26,3,top=(225,225,228),bot=(140,142,146))
    save(img.convert("RGB"),name)

def build_center_banner(name,pill,title,subtitle):
    img=make_background().convert("RGBA"); d=ImageDraw.Draw(img)
    cx=W//2; pf=font(20)
    pw=d.textbbox((0,0),pill,font=pf)[2]; px,py=22,10
    bw,bh=pw+px*2,20+py*2; bx,by=cx-bw//2,34
    d.rounded_rectangle([bx,by,bx+bw,by+bh],radius=bh//2,outline=(225,225,228),width=2,fill=(12,12,13))
    d.text((cx-pw//2,by+py-2),pill,font=pf,fill=(225,225,228))
    sz=64; sp=3
    while sz>34 and measure_w(d,title,sz,sp)>W-80: sz-=2
    tw=measure_w(d,title,sz,sp)
    metallic_text(d,img,(cx-tw//2,by+bh+18),title,sz,sp)
    sw=measure_w(d,subtitle,26,2)
    metallic_text(d,img,(cx-sw//2,by+bh+18+sz+22),subtitle,26,2,top=(225,225,228),bot=(150,152,156))
    save(img.convert("RGB"),name)

def build_divider(name,bar_h=64):
    img=Image.new("RGB",(W,bar_h),BLACK); d=ImageDraw.Draw(img)
    for x in range(W):
        t=x/W; r=int(20+(90-20)*t); g=int(4+(8-4)*t); b=int(6+(12-6)*t)
        d.line([(x,0),(x,bar_h)],fill=(r,g,b))
    mask=Image.new("L",(W,bar_h),0)
    ImageDraw.Draw(mask).rounded_rectangle([0,0,W-1,bar_h-1],radius=bar_h//2,fill=255)
    rounded=Image.new("RGB",(W,bar_h),(10,10,11)); rounded.paste(img,(0,0),mask)
    logo=Image.open(LOGO_PATH).convert("RGBA")
    mark=logo.crop((0,0,logo.width,int(logo.height*.62)))
    ratio=(bar_h-20)/mark.height; mark=mark.resize((max(1,int(mark.width*ratio)),bar_h-20))
    feather=Image.new("L",mark.size,0); fd=ImageDraw.Draw(feather)
    ins=10; fd.ellipse([ins,ins,mark.size[0]-ins,mark.size[1]-ins],fill=255)
    feather=feather.filter(ImageFilter.GaussianBlur(10))
    mark.putalpha(ImageChops.multiply(mark.split()[3],feather))
    rounded=rounded.convert("RGBA")
    rounded.paste(mark,((W-mark.width)//2,(bar_h-mark.height)//2),mark)
    save(rounded.convert("RGB"),name)

build_side_banner("welcome_banner.png","APEX DESIGNS","STAND ABOVE THE REST.")
build_side_banner("ticket_banner.png","NEW ORDER","CUSTOM ORDER TICKET OPENED")
build_side_banner("pricelist_banner.png","PRICE LIST","QUALITY DESIGNS. FAIR PRICES.")
build_side_banner("portfolio_banner.png","PORTFOLIO","SEE OUR WORK SPEAK FOR ITSELF")
build_side_banner("vouch_banner.png","VOUCHES","WHAT OUR CLIENTS ARE SAYING")
build_side_banner("staff_banner.png","STAFF DASHBOARD","APEX DESIGNS OPERATIONS")
build_center_banner("dashboard_panel_banner.png","APEX DESIGNS","DASHBOARD","STAND ABOVE THE REST.")
build_center_banner("orderpanel_banner.png","APEX DESIGNS","ORDER SERVICE","STAND ABOVE THE REST.")
build_divider("divider_bar.png")
print("all done")
