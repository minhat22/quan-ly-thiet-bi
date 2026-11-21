<?php
require __DIR__ . '/../includes/auth_check.php';
require __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../includes/response.php';



function body_json(): array {
    $v = json_decode(file_get_contents('php://input'), true);
    return is_array($v) ? $v : [];
}



//cập nhật trạng thái hàng
function refresh_status(PDO $pdo): void {
    $pdo->exec("UPDATE PhieuMuon SET TrangThai = CASE WHEN NgayTra IS NOT NULL THEN 'Đã trả' WHEN HenTra < CURDATE() THEN 'Quá hạn' ELSE 'Đang mượn' END");
}



function load_data(PDO $pdo): array {
    refresh_status($pdo);
    $devices = $pdo->query("SELECT ID id, Ten name, Model model, Loai type, TongSo qty, BaoTri maintenance FROM ThietBi ORDER BY ID DESC")->fetchAll();
    $loans = $pdo->query("SELECT p.ID id, n.HoTen borrower, n.DonVi unit, n.SDT phone, p.NgayMuon borrowDate, p.HenTra dueDate, COALESCE(p.NgayTra,'') returnDate, p.TrangThai status FROM PhieuMuon p JOIN NguoiMuon n ON n.ID=p.ID_NguoiMuon ORDER BY p.ID DESC")->fetchAll();
    foreach ($loans as &$loan) {
        $s = $pdo->prepare("SELECT c.ID_ThietBi deviceId, t.Ten name, c.SoLuong qty FROM ChiTietPhieu c JOIN ThietBi t ON t.ID=c.ID_ThietBi WHERE c.ID_Phieu=?");
        $s->execute([$loan['id']]);
        $loan['items'] = $s->fetchAll();
        $loan['id'] = (int)$loan['id'];
        foreach ($loan['items'] as &$it) { 
          $it['deviceId']=(int)$it['deviceId']; $it['qty']=(int)$it['qty']; 
          } 
          unset($it);
    } 
    unset($loan);
    $stock = $pdo->query("SELECT l.ID_ThietBi deviceId,t.Ten deviceName,l.ThaoTac action,l.SoLuong amount,l.GhiChu note,l.ThoiGian time FROM LichSuKho l JOIN ThietBi t ON t.ID=l.ID_ThietBi ORDER BY l.ID DESC LIMIT 50")->fetchAll();
    // Hoat dong gan day: suy ra tu PhieuMuon + ChiTietPhieu (khong can bang rieng)
    $activities = $pdo->query("SELECT * FROM (
        SELECT 'create' type, n.HoTen borrower,
               (SELECT GROUP_CONCAT(CONCAT(c.SoLuong,' ',t.Ten) SEPARATOR ', ') FROM ChiTietPhieu c JOIN ThietBi t ON t.ID=c.ID_ThietBi WHERE c.ID_Phieu=p.ID) summary,
               p.NgayMuon time, p.ID pid, 0 ord
        FROM PhieuMuon p JOIN NguoiMuon n ON n.ID=p.ID_NguoiMuon
        UNION ALL
        SELECT 'return' type, n.HoTen borrower,
               (SELECT GROUP_CONCAT(CONCAT(c.SoLuong,' ',t.Ten) SEPARATOR ', ') FROM ChiTietPhieu c JOIN ThietBi t ON t.ID=c.ID_ThietBi WHERE c.ID_Phieu=p.ID) summary,
               p.NgayTra time, p.ID pid, 1 ord
        FROM PhieuMuon p JOIN NguoiMuon n ON n.ID=p.ID_NguoiMuon WHERE p.NgayTra IS NOT NULL
    ) a ORDER BY time DESC, ord DESC, pid DESC LIMIT 30")->fetchAll();
    foreach ($activities as &$ac) { 
      unset($ac['pid'], $ac['ord']);
       }
      unset($ac);
    $borrowers=$pdo->query("SELECT ID id,HoTen name,DonVi unit,SDT phone FROM NguoiMuon ORDER BY ID DESC")->fetchAll();
    return ['devices'=>$devices,'customer'=>$borrowers,'loans'=>$loans,'stockLog'=>$stock,'activities'=>$activities,'stats'=>load_stats($pdo)];
}





// Thong ke cho trang chu: so luot muon/tra 6 thang gan day, top thiet bi, top nguoi muon
function load_stats(PDO $pdo): array {
    $months = [];
    for ($i = 5; $i >= 0; $i--) {
        $key = date('Y-m', strtotime("first day of -$i month"));
        $months[$key] = ['month' => $key, 'label' => 'T' . (int)substr($key, 5, 2), 'borrowed' => 0, 'returned' => 0];
    }
    $from = date('Y-m-01', strtotime('first day of -5 month'));
    $s = $pdo->prepare("SELECT DATE_FORMAT(NgayMuon,'%Y-%m') m, COUNT(*) c FROM PhieuMuon WHERE NgayMuon >= ? GROUP BY m");
    $s->execute([$from]);
    foreach ($s->fetchAll() as $r) if (isset($months[$r['m']])) $months[$r['m']]['borrowed'] = (int)$r['c'];
    $s = $pdo->prepare("SELECT DATE_FORMAT(NgayTra,'%Y-%m') m, COUNT(*) c FROM PhieuMuon WHERE NgayTra IS NOT NULL AND NgayTra >= ? GROUP BY m");
    $s->execute([$from]);
    foreach ($s->fetchAll() as $r) if (isset($months[$r['m']])) $months[$r['m']]['returned'] = (int)$r['c'];

    $topDevices = $pdo->query("SELECT t.Ten name, COUNT(DISTINCT c.ID_Phieu) loans, SUM(c.SoLuong) qty FROM ChiTietPhieu c JOIN ThietBi t ON t.ID=c.ID_ThietBi GROUP BY t.ID, t.Ten ORDER BY qty DESC, loans DESC LIMIT 5")->fetchAll();
    $topBorrowers = $pdo->query("SELECT n.HoTen name, n.DonVi unit, COUNT(*) loans FROM PhieuMuon p JOIN NguoiMuon n ON n.ID=p.ID_NguoiMuon GROUP BY n.ID, n.HoTen, n.DonVi ORDER BY loans DESC, n.HoTen LIMIT 5")->fetchAll();
    foreach ($topDevices as &$d) { 
    $d['loans'] = (int)$d['loans'];
    $d['qty'] = (int)$d['qty'];
     } 
     unset($d);
    foreach ($topBorrowers as &$b) { 
      $b['loans'] = (int)$b['loans'];
       } 
       unset($b);

    $total = (int)$pdo->query("SELECT COUNT(*) FROM PhieuMuon")->fetchColumn();
    $returned = (int)$pdo->query("SELECT COUNT(*) FROM PhieuMuon WHERE NgayTra IS NOT NULL")->fetchColumn();
    $overdue = (int)$pdo->query("SELECT COUNT(*) FROM PhieuMuon WHERE TrangThai='Quá hạn'")->fetchColumn();
    return [
        'months' => array_values($months),
        'topDevices' => $topDevices,
        'topBorrowers' => $topBorrowers,
        'totalLoans' => $total,
        'returnRate' => $total ? round($returned * 100 / $total) : 0,
        'overdueRate' => $total ? round($overdue * 100 / $total) : 0,
    ];
}



if ($_SERVER['REQUEST_METHOD'] === 'GET') json_ok(load_data($pdo));
if ($_SERVER['REQUEST_METHOD'] !== 'POST') json_error('Sai phương thức',405);
$in=body_json(); 
$action=$in['action']??'';
$notice=null;



// Xử lý tương tác dữ liệu trên app và sql như nhập kho, sửa thiết bị, tạo phiếu mượn...
try {
  if ($action==='device_create' || $action==='device_update') {
    $name=trim($in['name']??''); 
    $model=trim($in['model']??''); 
    $type=trim($in['type']??''); 
    $qty=(int)($in['qty']??0); 
    $id=(int)($in['id']??0);
    if($name===''||$model===''||$type===''||mb_strlen($model)>100||$qty<0||$qty>100000) json_error('Thông tin thiết bị không hợp lệ (cần nhập Tên, Model, Loại và số lượng)');
    if($action==='device_create') {
      // NHẬP KHO: kiểm tra Model. Trùng -> cộng thêm số lượng vào thiết bị cũ; chưa có -> tạo thiết bị mới.
      if($qty<1) json_error('Số lượng nhập kho phải từ 1 trở lên');
      $pdo->beginTransaction();
      $f=$pdo->prepare('SELECT ID,Ten,TongSo FROM ThietBi WHERE Model=? FOR UPDATE'); 
      $f->execute([$model]); 
      $exist=$f->fetch();
      if($exist) {
        $newTotal=(int)$exist['TongSo']+$qty;
        if($newTotal>100000){ 
        $pdo->rollBack(); 
        json_error('Tổng số lượng vượt quá giới hạn cho phép');
         }
        $u=$pdo->prepare('UPDATE ThietBi SET TongSo=? WHERE ID=?'); 
        $u->execute([$newTotal,$exist['ID']]);
        $l=$pdo->prepare('INSERT INTO LichSuKho(ID_ThietBi,ThaoTac,SoLuong,GhiChu) VALUES(?,?,?,?)'); 
        $l->execute([$exist['ID'],'add',$qty,'Nhập kho trùng model '.$model]);
        $notice="Model {$model} đã có ({$exist['Ten']}): đã cộng thêm {$qty}, tổng mới {$newTotal}";
      } else {
        $s=$pdo->prepare('INSERT INTO ThietBi(Ten,Model,Loai,TongSo,BaoTri) VALUES(?,?,?,?,0)'); 
        $s->execute([$name,$model,$type,$qty]);
        $l=$pdo->prepare('INSERT INTO LichSuKho(ID_ThietBi,ThaoTac,SoLuong,GhiChu) VALUES(?,?,?,?)'); 
        $l->execute([$pdo->lastInsertId(),'add',$qty,'Nhập kho model mới '.$model]);
        $notice="Đã thêm thiết bị mới, model {$model}";
      }
      $pdo->commit();
    }
    else { 
      $c=$pdo->prepare('SELECT TongSo,BaoTri FROM ThietBi WHERE ID=?');
      $c->execute([$id]);$old=$c->fetch();
      if(!$old)json_error('Không tìm thấy thiết bị',404);
      $dup=$pdo->prepare('SELECT COUNT(*) FROM ThietBi WHERE Model=? AND ID<>?');
      $dup->execute([$model,$id]);if($dup->fetchColumn())json_error('Model này đã tồn tại ở thiết bị khác');
      $b=$pdo->prepare("SELECT COALESCE(SUM(c.SoLuong),0) FROM ChiTietPhieu c JOIN PhieuMuon p ON p.ID=c.ID_Phieu WHERE c.ID_ThietBi=? AND p.NgayTra IS NULL");
      $b->execute([$id]);
      if($qty < (int)$old['BaoTri'] + (int)$b->fetchColumn())json_error('Tổng số không thể nhỏ hơn số đang mượn cộng số bảo trì');$s=$pdo->prepare('UPDATE ThietBi SET Ten=?,Model=?,Loai=?,TongSo=? WHERE ID=?'); 
      $s->execute([$name,$model,$type,$qty,$id]); 
      }

  } elseif($action==='device_delete') {

    $id=(int)($in['id']??0); $c=$pdo->prepare("SELECT COUNT(*) FROM ChiTietPhieu c JOIN PhieuMuon p ON p.ID=c.ID_Phieu WHERE c.ID_ThietBi=? AND p.TrangThai<>'Đã trả'");$c->execute([$id]); if($c->fetchColumn())json_error('Thiết bị đang được mượn, không thể xóa');
    $c=$pdo->prepare('SELECT COUNT(*) FROM ChiTietPhieu WHERE ID_ThietBi=?');$c->execute([$id]);if($c->fetchColumn())json_error('Thiết bị đã có lịch sử mượn, không thể xóa');
    $s=$pdo->prepare('DELETE FROM ThietBi WHERE ID=?');$s->execute([$id]);

  } elseif($action==='stock') {

    $id=(int)($in['id']??0);$amount=(int)($in['amount']??0);$op=$in['operation']??'';
    $note=trim($in['note']??'');

    if($amount<1)
      json_error('Số lượng phải từ 1 trở lên');

    $pdo->beginTransaction();$s=$pdo->prepare('SELECT * FROM ThietBi WHERE ID=? FOR UPDATE');
    $s->execute([$id]);
    $d=$s->fetch();

    if(!$d){
      $pdo->rollBack();
    json_error('Không tìm thấy thiết bị',404);
    }

    $borrow=$pdo->prepare("SELECT COALESCE(SUM(c.SoLuong),0) FROM ChiTietPhieu c JOIN PhieuMuon p ON p.ID=c.ID_Phieu WHERE c.ID_ThietBi=? AND p.NgayTra IS NULL");
    $borrow->execute([$id]);
    $borrowed=(int)$borrow->fetchColumn();
    $ready=(int)$d['TongSo']-$borrowed-(int)$d['BaoTri'];
    $maint=(int)$d['BaoTri'];
    $total=(int)$d['TongSo'];

    if($op==='add')
      $total+=$amount;
    elseif($op==='broken'){
      if($amount>$ready) { 
    $pdo->rollBack();
    json_error('Số lượng sẵn sàng không đủ');
     }
     $maint+=$amount;

     }elseif($op==='fixed'){
      if($amount>$maint){
        $pdo->rollBack();
        json_error('Số lượng bảo trì không đủ');

        }
        $maint-=$amount;

        }elseif($op==='dispose'){

          if($amount>$ready+$maint){
            $pdo->rollBack();
            json_error('Không thể thanh lý số lượng đang mượn');

            }
            $maint-=min($amount,$maint);
            $total-=$amount;

            }else{
              $pdo->rollBack();
              json_error('Thao tác kho không hợp lệ');

              }
    $u=$pdo->prepare('UPDATE ThietBi SET TongSo=?,BaoTri=? WHERE ID=?');
    $u->execute([$total,$maint,$id]);
    $l=$pdo->prepare('INSERT INTO LichSuKho(ID_ThietBi,ThaoTac,SoLuong,GhiChu) VALUES(?,?,?,?)');
    $l->execute([$id,$op,$amount,$note]);
    $pdo->commit();

  } elseif($action==='loan_create') {
    // Nguoi muon bat buoc phai la ho so da ton tai trong bang NguoiMuon.
    // Tuyet doi khong tu dong tao moi nguoi muon tu du lieu form phieu.
    $bid=(int)($in['borrowerId']??0);
    $bd=$in['borrowDate']??date('Y-m-d');
    $due=$in['dueDate']??'';
    $items=$in['items']??[];
    $isDate=static function($value): bool {
      if(!is_string($value)) return false;
      $d=DateTime::createFromFormat('!Y-m-d',$value);
      return $d && $d->format('Y-m-d')===$value;

    };
    if($bid<1||!$isDate($bd)||!$isDate($due)||$due<$bd||!is_array($items)||!count($items)) json_error('Vui lòng chọn người mượn có sẵn và nhập ngày mượn, ngày hẹn trả hợp lệ');
    $pdo->beginTransaction();
    $s=$pdo->prepare('SELECT ID,HoTen FROM NguoiMuon WHERE ID=? FOR UPDATE');
    $s->execute([$bid]);
    $borrowerRow=$s->fetch();
    if(!$borrowerRow){
      $pdo->rollBack();
      json_error('Người mượn không tồn tại trong danh sách. Hãy thêm người này tại trang Người mượn trước.',422);
      
      }
    $borrower=$borrowerRow['HoTen'];
    $merged=[];
    foreach($items as $it){
      $did=(int)($it['deviceId']??0);
      $q=(int)($it['qty']??0);
      if($did<1||$q<1){
        $pdo->rollBack();
        json_error('Thiết bị hoặc số lượng không hợp lệ');

      }$merged[$did]=($merged[$did]??0)+$q;
      
      }
    foreach($merged as $did=>$q){
    $s=$pdo->prepare('SELECT TongSo,BaoTri FROM ThietBi WHERE ID=? FOR UPDATE');
    $s->execute([$did]);
    $d=$s->fetch();

    if(!$d){$pdo->rollBack();
    json_error('Thiết bị không tồn tại');
    
    }$s=$pdo->prepare("SELECT COALESCE(SUM(c.SoLuong),0) FROM ChiTietPhieu c JOIN PhieuMuon p ON p.ID=c.ID_Phieu WHERE c.ID_ThietBi=? AND p.NgayTra IS NULL");
    $s->execute([$did]);
    $ready=(int)$d['TongSo']-(int)$d['BaoTri']-(int)$s->fetchColumn();
    
    if($q>$ready){
      $pdo->rollBack();
      json_error('Không đủ số lượng thiết bị trong kho.');
      
      }
      }
    $s=$pdo->prepare('INSERT INTO PhieuMuon(ID_NguoiMuon,NgayMuon,HenTra,TrangThai) VALUES(?,?,?,?)');
    $s->execute([$bid,$bd,$due,$due<date('Y-m-d')?'Quá hạn':'Đang mượn']);
    $pid=$pdo->lastInsertId();
    $detail=$pdo->prepare('INSERT INTO ChiTietPhieu(ID_Phieu,ID_ThietBi,SoLuong) VALUES(?,?,?)');

    foreach($merged as $did=>$q)
      $detail->execute([$pid,$did,$q]);
      $pdo->commit();

  } elseif($action==='loan_return') {
    $id=(int)($in['id']??0);
    $pdo->beginTransaction();
    $s=$pdo->prepare("SELECT p.ID,n.HoTen FROM PhieuMuon p JOIN NguoiMuon n ON n.ID=p.ID_NguoiMuon WHERE p.ID=? FOR UPDATE");
    $s->execute([$id]);
    $p=$s->fetch();

    if(!$p){
      $pdo->rollBack();
      json_error('Không tìm thấy phiếu mượn',404);
      } 
      $u=$pdo->prepare("UPDATE PhieuMuon SET NgayTra=CURDATE(),TrangThai='Đã trả' WHERE ID=? AND NgayTra IS NULL");
      $u->execute([$id]);
      $pdo->commit();

  } elseif($action==='loan_delete') {
    // Xoa / huy phieu: ChiTietPhieu tu xoa theo (ON DELETE CASCADE). Ton kho tinh tu phieu chua tra nen tu hoan lai.
    $id=(int)($in['id']??0);
    $pdo->beginTransaction();
    $s=$pdo->prepare('SELECT ID FROM PhieuMuon WHERE ID=? FOR UPDATE');
    $s->execute([$id]);
    if(!$s->fetch()){
      $pdo->rollBack();
      json_error('Không tìm thấy phiếu mượn',404);}
    $d=$pdo->prepare('DELETE FROM PhieuMuon WHERE ID=?');
    $d->execute([$id]);
    $pdo->commit();
  } else json_error('Hành động không hợp lệ');
  $out=load_data($pdo); 
  if($notice!==null)
    $out['notice']=$notice; 
  json_ok($out);
} catch(Throwable $e) { 
if($pdo->inTransaction())
$pdo->rollBack();
error_log((string)$e); 
json_error('Không thể thực hiện thao tác. Kiểm tra cấu trúc CSDL và dữ liệu nhập.',500); 
}
