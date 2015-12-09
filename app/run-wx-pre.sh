#!/usr/bin/expect

set timeout 400

spawn scp -P 1314 -r assets root@120.25.104.171:/opt/node/app/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@120.25.104.171's password:*" {
send "(PveWR4QV3\r";
exp_continue;
}
}

spawn scp -P 1314 -r bower_components root@120.25.104.171:/opt/node/app/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@120.25.104.171's password:*" {
send "(PveWR4QV3\r";
exp_continue;
}
}

spawn scp -P 1314 -r build root@120.25.104.171:/opt/node/app/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@120.25.104.171's password:*" {
send "(PveWR4QV3\r";
exp_continue;
}
}

spawn scp -P 1314 -r index.html root@120.25.104.171:/opt/node/app/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@120.25.104.171's password:*" {
send "(PveWR4QV3\r";
exp_continue;
}
}
