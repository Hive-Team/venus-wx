#!/usr/bin/expect

set timeout 400

spawn scp -r assets root@192.168.1.4:/home/bfjs/venus-platform/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@192.168.1.4's password:*" {
send "test\r";
exp_continue;
}
}

spawn scp -r bower_components root@192.168.1.4:/home/bfjs/venus-platform/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@192.168.1.4's password:*" {
send "test\r";
exp_continue;
}
}

spawn scp -r build root@192.168.1.4:/home/bfjs/venus-platform/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@192.168.1.4's password:*" {
send "test\r";
exp_continue;
}
}

spawn scp -r index.html root@192.168.1.4:/home/bfjs/venus-platform/dist/
expect {
"*yes/no*" {
send "yes\n";
exp_continue;
}
"root@192.168.1.4's password:*" {
send "test\r";
exp_continue;
}
}
