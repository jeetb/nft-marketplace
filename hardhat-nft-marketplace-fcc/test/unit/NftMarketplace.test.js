const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { network, deployments, getNamedAccounts, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Nft Marketplace Tests", function () {
      let nftMarketplace, basicNft, deployer, player;
      const PRICE = ethers.utils.parseEther("0.1");
      const TOKEN_ID = 0;
      beforeEach(async () => {
        //deployer = (await getNamedAccounts()).deployer;
        //player = (await getNamedAccounts()).player;
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        player = accounts[1];
        await deployments.fixture(["all"]);
        nftMarketplaceContract = await ethers.getContract("NftMarketplace");
        nftMarketplace = nftMarketplaceContract.connect(deployer);
        basicNftContract = await ethers.getContract("BasicNft");
        basicNft = await basicNftContract.connect(deployer);
        await basicNft.mintNft();
        await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID);
      });
      it("lists and can be bought", async function () {
        await nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE);
        console.log(2);
        const playerConnectedNftMarketplace =
          await nftMarketplaceContract.connect(player);

        await playerConnectedNftMarketplace.buyItem(
          basicNft.address,
          TOKEN_ID,
          { value: PRICE }
        );
        const newOwner = await basicNft.ownerOf(TOKEN_ID);
        const deployerProceeds = await nftMarketplace.getProceeds(
          deployer.address
        );

        assert(newOwner.toString() == player.address);
        assert(deployerProceeds.toString() == PRICE.toString());
      });
    });
