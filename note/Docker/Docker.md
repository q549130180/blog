Docker 是一个开源的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的容器中，然后发布到任何运行 Docker 环境的机器上。Docker 生态圈的快速发展大大提高了微服务的部署与发布效率。


官网：https://www.docker.com/
docker hub：https://hub.docker.com/
docker doc：https://docs.docker.com



升级内核

rpm --import https://www.elrepo.org/RPM-GPG-KEY-elrepo.org

rpm -Uvh http://www.elrepo.org/elrepo-release-7.0-2.el7.elrepo.noarch.rpm


http://www.linuxidc.com/Linux/2015-02/112697.htm

yum源安装

```bash
tee /etc/yum.repos.d/docker.repo <<-'EOF'
[dockerrepo]
name=Docker Repository
baseurl=https://yum.dockerproject.org/repo/main/centos/7/
enabled=1
gpgcheck=1
gpgkey=https://yum.dockerproject.org/gpg
EOF
```




脚本自动安装
