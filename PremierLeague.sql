-- CREATE TABLE CauThu (
--     TenCauThu varchar(50) not null,
--     MSCT char(8) not null,
--     SoAo int not null,
--     MaCLB char(8) not null,
--     Vitri varchar(30) not null,
--     QuocTich varchar(50) not null,
--     Tuoi int not null,
--     NgaySinh date not null,
--     ChieuCao float not null,
--     CanNang float not null,
--     AvatarUrl varchar(500) not null,
--     SoBan int default 0,
--     KienTao int default 0
-- );
-- CREATE TABLE DoiBong (
--     MaCLB char(8) not null,
--     Ten varchar(30) not null,
--     NamThanhLap date not null,
--     LogoUrl varchar(300) not null,
--     SanNha varchar(30) not null,
--     TenHLV varchar(30) not null,
--     SoDanhHieu int not null,
--     Diem int default 0,
--     SoTranThang int  default 0,
--     SoTranHoa int default 0,
--     SoTranThua int default 0,
--     SoBanThang int default 0,
--     SoBanThua int default 0
-- );
-- CREATE TABLE TranDau(
--     MaTran char(8) not null,
--     MaDoiNha char(8) not null,
--     MaDoiKhach char(8) not null,
--     VongDau int not null,
--     SoBanDoiNha int default 0,
--     SoBanDoiKhach int default 0,
--     ThoiGian date,
--     HighLightSrc varchar(300) default 'ChuaDau'
-- );
-- CREATE TABLE BanThang(
--     MaTran char(8) not null,
--     MaCT char(8) not null,
--     MaCTKienTao char(8) not null
-- );
-- CREATE TABLE taikhoan(
--     TenDangNhap varchar(30) UNIQUE not null,
--     MatKhau varchar(30) not null
-- );
-- CREATE TABLE BinhLuan(
--     MaTran char(8) not null,
--     TenDangNhap varchar(30) not null,
--     BinhLuan varchar(300) not null
-- )
-- CREATE TABLE ghe(
--     maghe char(8) not null,
--     tensan varchar(30) not null,
--     khandai varchar(30) not null,
--     hang varchar(30) not null,
--     cots varchar(30) no null,
--     gia int not null
-- )
-- CREATE TABLE ve(
--     matran char(8),
--     maghe char(8),
--     username varchar(30)
-- )
-- create trigger af_insert_banthang
-- after insert on banthang
-- for each row
-- execute procedure af_banthang();

-- create or replace function af_banthang() returns trigger as 
-- $$
-- begin
--    -- update banthang
--    update cauthu ct
--    set soban = soban + 1
--    where ct.msct = new.mact;
--     -- update kien tao
--    update cauthu ct
--    set kientao = kientao + 1
--    where ct.msct = new.mactkientao;
--    return new;
-- end
-- $$
-- language plpgsql;

-- create trigger af_insert_trandau
-- after update on trandau
-- for each row
-- execute procedure af_trandau()

-- create or replace function af_trandau() returns trigger as
-- $$
-- begin
--     if new.trangthai = 'dadau' then
--         if new.sobandoinha > new.sobandoikhach then -- doi nha thang
--             -- update doi nha
--             update DoiBong
--             set  diem = diem + 3 , sotranthang = sotranthang + 1 , sobanthang = sobanthang + new.sobandoinha , sobanthua = sobanthua + new.sobandoikhach
--             where maclb = new.madoinha; 
--             -- update doi khach 
--             update DoiBong
--             set  sotranthua = sotranthua + 1 , sobanthua = sobanthua + new.sobandoinha , sobanthang = sobanthang + new.sobandoikhach
--             where maclb = new.madoikhach; 
--         elsif new.sobandoinha = new.sobandoikhach then -- 2 doi hoa
--             -- update doi nha
--             update DoiBong
--             set  diem = diem + 1 , sotranhoa = sotranhoa + 1 , sobanthang = sobanthang + new.sobandoinha , sobanthua = sobanthua + new.sobandoikhach
--             where maclb = new.madoinha; 
--             -- update doi khach 
--             update DoiBong
--             set  diem = diem + 1 , sotranhoa = sotranhoa + 1 , sobanthua = sobanthua + new.sobandoinha , sobanthang = sobanthang + new.sobandoikhach
--             where maclb = new.madoikhach;     
--         elsif new.sobandoikhach > new.sobandoinha then -- doi khach thang
--             -- update doi nha
--             update DoiBong
--             set  diem = diem + 0 , sotranthua = sotranthua + 1 , sobanthang = sobanthang + new.sobandoinha , sobanthua = sobanthua + new.sobandoikhach
--             where maclb = new.madoinha; 
--             -- update doi khach 
--             update DoiBong
--             set  diem = diem + 3 , sotranthang = sotranthang + 1 , sobanthua = sobanthua + new.sobandoinha , sobanthang = sobanthang + new.sobandoikhach
--             where maclb = new.madoikhach;     
--         end if;
--     end if;
--     return new;
-- end;
-- $$
-- language plpgsql



create trigger af_insert1_trandau
after insert on trandau
for each row
execute procedure afinser_trandau()



create or replace function afinser_trandau() returns trigger as
$$
begin
    if new.trangthai = 'dadau' then
        if new.sobandoinha > new.sobandoikhach then -- doi nha thang
            -- update doi nha
            update DoiBong
            set  diem = diem + 3 , sotranthang = sotranthang + 1 , sobanthang = sobanthang + new.sobandoinha , sobanthua = sobanthua + new.sobandoikhach
            where maclb = new.madoinha; 
            -- update doi khach 
            update DoiBong
            set  sotranthua = sotranthua + 1 , sobanthua = sobanthua + new.sobandoinha , sobanthang = sobanthang + new.sobandoikhach
            where maclb = new.madoikhach; 
        elsif new.sobandoinha = new.sobandoikhach then -- 2 doi hoa
            -- update doi nha
            update DoiBong
            set  diem = diem + 1 , sotranhoa = sotranhoa + 1 , sobanthang = sobanthang + new.sobandoinha , sobanthua = sobanthua + new.sobandoikhach
            where maclb = new.madoinha; 
            -- update doi khach 
            update DoiBong
            set  diem = diem + 1 , sotranhoa = sotranhoa + 1 , sobanthua = sobanthua + new.sobandoinha , sobanthang = sobanthang + new.sobandoikhach
            where maclb = new.madoikhach;     
        elsif new.sobandoikhach > new.sobandoinha then -- doi khach thang
            -- update doi nha
            update DoiBong
            set  diem = diem + 0 , sotranthua = sotranthua + 1 , sobanthang = sobanthang + new.sobandoinha , sobanthua = sobanthua + new.sobandoikhach
            where maclb = new.madoinha; 
            -- update doi khach 
            update DoiBong
            set  diem = diem + 3 , sotranthang = sotranthang + 1 , sobanthua = sobanthua + new.sobandoinha , sobanthang = sobanthang + new.sobandoikhach
            where maclb = new.madoikhach;     
        end if;
    end if;
    return new;
end;
$$
language plpgsql