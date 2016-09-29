






oracle生成UUID函数
```sql
select sys_guid() from dual;
```


对特殊字符进行转义
```sql
select * from sc_sys_user s  where 1 =1 and s.name like '%\%%' escape '\';
```

锁表查询，解锁
```sql
select object_name,machine,s.sid,s.serial#
from v$locked_object l,dba_objects o ,v$session s
where l.object_id　=　o.object_id and l.session_id=s.sid;
/*解锁*/
alter system kill session '77,19536';
```

查看当前用户
```sql
select p.SPID,s.terminal ,s.PROGRAM,s.USERNAME 用户名,last_call_et 持续时间,status 状态,lockwait 等待锁,machine 用户计算机名,logon_time 开始登入时间,sql_text
from v$session s,v$process p ,v$sql sq
where paddr = addr and sql_hash_value=hash_value
and status = 'ACTIVE' and s.username is not null
order by last_call_et desc;
```
