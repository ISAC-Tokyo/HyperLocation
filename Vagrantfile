# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu12.04"
  config.vm.box_url = "http://opscode-vm-bento.s3.amazonaws.com/vagrant/virtualbox/opscode_ubuntu-12.04_chef-provisionerless.box"
  config.vm.hostname = "hyperlocation.local"


  config.vm.provider :virtualbox do |vb|
    vb.customize ["modifyvm", :id, "--memory", "3048", "--cpus", "2", "--ioapic", "on"]
  end

  config.vm.provision :shell, :inline => "sudo apt-get update"
  config.vm.provision :shell, :inline => "sudo apt-get install language-pack-ja"
  config.vm.provision :shell, :inline => "sudo dpkg-reconfigure locales"
  config.vm.provision :shell, :inline => "sudo update-locale LANG=ja_JP.UTF-8"
  config.vm.provision :shell, :inline => "sudo apt-get install git"
  config.vm.provision :shell, :inline => "sudo apt-get install vim"
  config.vm.provision :shell, :inline => "sudo apt-get install screen"
  config.vm.provision :shell, :inline => "sudo apt-get install tmux"
  config.vm.provision :shell, :inline => "sudo apt-get install zsh"

end
