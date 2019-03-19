/**
 * Unit tests for evaTaskList.js
 */
let evaTaskList = require('../app/models/evaTaskList'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  _ = require('lodash'),
  path = require('path');

const YAML = require('yamljs');

/**
 * Testing for create
 */
describe('create Testing', function() {
    describe('Normal create', () => {
        it('should create a valid evaTaskList object', () => {
                
            //TODO: Use more realistic parameters
            let fakeProcedureName = 1;
            let fakeActors = 2;
            let fakeTaskFiles = 3;

            let ecl = new evaTaskList.create(
                fakeProcedureName,
                fakeActors,
                fakeTaskFiles);

            expect(ecl).to.exist;
            expect(ecl.procedure_name).to.equal(1);
            expect(ecl.actors).to.equal(2);
            expect(ecl.taskFiles).to.equal(3);
            expect(ecl.tasks).to.be.an('array');

        });
    });
});

/**
 * Negative testing for createFromYaml
 */
describe('createFromYaml - Negative Testing', function() {
    describe('Bad Input', () => {
        it('should return null if yaml is missing procedure_name', () => {
            let yamlString = `

                actors:
                    - role: IV/SSRMS
                    - role: EV1
                      name: Drew
                    - role: EV2
                      name: Taz

                tasks:
                    - file: egress.yml
                    - file: misse7.yml
                `;

            let yamlObject = YAML.parse(yamlString);

            expect(yamlObject).to.exist;

            let ecl = evaTaskList.createFromYaml(yamlObject);

            expect(ecl).to.be.null;
        });

        it('should return null if yaml is missing actors', () => {
            let yamlString = `
                procedure_name: Foo Procedure 1

                tasks:
                    - file: egress.yml
                    - file: misse7.yml
                `;

            let yamlObject = YAML.parse(yamlString);

            expect(yamlObject).to.exist;

            let ecl = evaTaskList.createFromYaml(yamlObject);

            expect(ecl).to.be.null;
        });

        it('should return null if yaml is missing tasks', () => {
            let yamlString = `
                procedure_name: Foo Procedure 1

                actors:
                    - role: IV/SSRMS
                    - role: EV1
                      name: Drew
                    - role: EV2
                      name: Taz

                `;
            let yamlObject = YAML.parse(yamlString);

            expect(yamlObject).to.exist;

            let ecl = evaTaskList.createFromYaml(yamlObject);

            expect(ecl).to.be.null;
        });
    });
});

/**
 * Positive testing for createFromYaml
 */
describe('createFromYaml - Positive Testing', function() {
    describe('Normal Input', () => {
        it('should return an evaChecklist for normal input', () => {
            let yamlString = `
                procedure_name: Foo Procedure 1

                actors:
                    - role: IV/SSRMS
                    - role: EV1
                      name: Drew
                    - role: EV2
                      name: Taz

                tasks:
                    - file: egress.yml
                    - file: misse7.yml
                `;

            let yamlObject = YAML.parse(yamlString);

            expect(yamlObject).to.exist;

            let ecl = evaTaskList.createFromYaml(yamlObject);

            expect(ecl).to.exist;

            expect(ecl.procedure_name).to.be.a('string');
            expect(ecl.procedure_name).to.equal('Foo Procedure 1');

            expect(ecl.actors).to.be.an('array');
            expect(ecl.actors).to.have.all.keys(0, 1, 2);

            expect(ecl.actors[0].role).to.equal('IV/SSRMS');
            expect(ecl.actors[1].role).to.equal('EV1');
            expect(ecl.actors[2].role).to.equal('EV2');

            expect(ecl.actors[1].name).to.equal('Drew');
            expect(ecl.actors[2].name).to.equal('Taz');
        });
    });
});

/**
 * Positive testing for createFromFile
 */
describe('createFromFile - Positive Testing', function() {
    describe('Normal Input', () => {
        it('should return an evaChecklist for normal input', () => {
        });
    });
});

/*
//test genericEVATask
describe('evaTaskList', function () {
  let fsStub, yamlStub, evaTaskStub;

  before(() => {
    sinon.spy(_, 'get');
    sinon.spy(path, 'dirname');
  });

  beforeEach(() => {
    lineReaderStub = {
      createInterface: sinon.stub().returns({
        on: sinon.stub()
      })
    };
  });

  beforeEach(() => {
    fsStub = {
      readFileSync: sinon.spy(),
      createReadStream: sinon.stub().returns(fakeTasksText())
    };
  });

  beforeEach(() => {
    evaTaskStub = {};
    evaTaskStub.create = sinon.stub();

  });

  beforeEach(() => {
    yamlStub = {};
    yamlStub.load = sinon.stub().returns({
      'procedure_name': 'fakeProcName',
      'actors': ['fakeActor1', 'fakeActor2'],
      'tasks': [{
        file: 'fakeFile1.yml'
      }, {
        file: 'fakeFile2.yml'
      }, {
        file: 'fakeFile3.yml'
      }]
    });
  });

  describe('generateEVATasks', () => {
    it('should return null when yaml path does not exists', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(false);

      // act
      evaTaskList.generateEVATasks(
        'fakeLocation',
        fsStub,
        yamlStub,
        _,
        path,
        evaTaskStub,
        (sut) => {
          // assert
          expect(sut).to.equal(null);
        }
      );


    });

    it('should throw an exception if no actors are found', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(true);

      // act
      yamlStub.load = sinon.stub().returns({
        'procedure_name': 'fakeProcName',
        'actors': null,
        'tasks': [{
          file: 'fakeFile1.yml'
        }, {
          file: 'fakeFile2.yml'
        }]
      });

      // assert
      expect(() => evaTaskList.generateEVATasks(
        'fakeLocation',
        fsStub,
        yamlStub,
        _,
        path,
        evaTaskStub,
        (sut) => {
          //Nothing to do here
        })).to.throw('no actors found in the file or incorrect yaml file');
    });

    it('should open the file content if the file exists', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(true);
      fsStub.readFileSync = sinon.stub().returns(fakeTasksText());


      // act
      evaTaskList.generateEVATasks(
        'fakeLocation',
        fsStub,
        yamlStub,
        _,
        path,
        evaTaskStub,
        (sut) => {

        });

      // assert
      expect(yamlStub.load.called).to.equal(true);
    });

    it('should use the YAML library to deserialize the file content', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(true);

      // act
      evaTaskList.generateEVATasks(
        'fakeLocation',
        fsStub,
        yamlStub,
        _,
        path,
        evaTaskStub,
        (sut) => {
          //Nothing to do here
        }
      );

      // assert
      expect(yamlStub.load.called).to.equal(true);
    });

    it('should generate the evaTasks from the task files', () => {
      // arrange
      fsStub.existsSync = sinon.stub().returns(true);

      // act
      evaTaskList.generateEVATasks(
        'fakeLocation',
        fsStub,
        yamlStub,
        _,
        path,
        evaTaskStub,
        (sut) => {
          // assert
          expect(sut.tasks.length).to.equal(3);
        }
      );
    });
  });

  /*


      //Test file is not null
      it('should pass that target is not null', function() {
        let testyml = doc.genericEvaTask(fileLocation);
        expect(testyml).to.not.be.null;
        expect(testyml).to.not.be.undefined;
      });

      //Test empty yml with only ---
      it('should not return a null object', function() {
        let testyml = doc.genericEvaTask(`./test/createdTestFiles/ymlDashEmptyFile.yml`);
        expect(testyml).to.not.be.null;
        expect(testyml).to.not.be.undefined;
      });

      //Test empty yml file with no characters
      it('should not return an empty object', function() {
        let testyml = doc.genericEvaTask(`./test/createdTestFiles/ymlEmptyFile.yml`);
        console.log(testyml);
        expect(testyml).to.not.be.undefined;
        expect(testyml).to.not.be.null;
      });

      //Test yml with only name:
      it('should return a non null object for valid name:', function() {
        var testyml = doc.genericEvaTask(`./test/createdTestFiles/ymlOneBlankName.yml`);
        expect(testyml).to.not.be.null;
        expect(testyml).to.not.be.undefined;
      });

      //Test empty yml file with no characters
      it('should return a non null object for name and text', function() {
        var testyml = doc.genericEvaTask(`./test/createdTestFiles/ymlOneName.yml`);
        expect(testyml).to.not.be.null;
      });
    });

    //Function should return parsed YML file test its contents
    describe('#validFileComparison', function() {
      //Test that contents are valid based on expected contents
      it('should compare deeply pma3-shields-and-connections to equal contents', function() {
        var testyml = doc.genericEvaTask(fileLocation);
    
        //create document as completely retrieved from genericEvaTask
        var textObj1 = {IV: [ { step: "Start (EV1) PMA3 CUMMERBUNDS PET (expect 00:30) ____:____" },
            { step: "Start (EV2) PMA3 CUMMERBUNDS PET (expect 00:30) ____:____" }] };
        var textObj2 = {EV1: [ { checks: ["Up CETA Spur to Face 1",
          "Nadir to LAB on port/outboard LAB strut",
          "Drop GREEN hook on inboard port LAB strut HR 1002 or Lab 0246 near base of port LAB strut" ],
            step: "Translate to PMA3 port/aft via Lab Struts, EV1 follows" } ] };
        var textObj3 = {EV2: [ { checks: [ "Around edge of ESP-2 to gap spanner",
          "Zenith across stbd Fluid Tray",
          "Drop GREEN hook on stbd LAB HR 0247 (near base of stbd LAB strut)" ],
            step: "Translate to PMA3 stbd/aft via ESP2 starboard route, EV2 leads" },
          {comment: "this is dumb",
            step: "Stow Cummerbund ORU Bag on PMA3 HR 1609 and 1605 (zenith stanchion) w/ hinge Nadir" },
          {step: "Open bag lid and restrain open using lid straps to HRs 1606 and 1605 (nadir stanchion)" } ] };
        var textObj4 = {"EV1 + EV2": [ { step: "Verify safety tethers not crossing" } ] };
        var textObj5 = {IV: [ {image: "pma3-large-oru-bag-location.jpg" } ] };
        var textObj6 = {"EV1 + EV2": [ { image: "pma3-translation.jpg"} ] };
            
        //insert document into object as if it was the yml file retrieved
        const initialyml = [ { title: 'PMA 3 cummerbunds install', 
          duration: 45, steps: [ textObj1, textObj2, textObj3, textObj4, textObj5, textObj6 ] } ];
    
        //test
        expect(initialyml).to.deep.equal(testyml);
      });
    });

    //Function should return parsed YML file test its contents
    describe('#invalidFileComparison', function() {
      //Contents should not be equal since file loaded is different
      it('should compare deeply pma3-shields-and-connections to not equal main', function() {
        var testyml = doc.genericEvaTask(mainYMLFileLocation);
    
        //create document of pma3-shields-and-connections as completely retrieved from genericEvaTask
        var textObj1 = {IV: [ { step: "Start (EV1) PMA3 CUMMERBUNDS PET (expect 00:30) ____:____" },
            { step: "Start (EV2) PMA3 CUMMERBUNDS PET (expect 00:30) ____:____" }] };
        var textObj2 = {EV1: [ { checks: ["Up CETA Spur to Face 1",
          "Nadir to LAB on port/outboard LAB strut",
          "Drop GREEN hook on inboard port LAB strut HR 1002 or Lab 0246 near base of port LAB strut" ],
            step: "Translate to PMA3 port/aft via Lab Struts, EV1 follows" } ] };
        var textObj3 = {EV2: [ { checks: [ "Around edge of ESP-2 to gap spanner",
          "Zenith across stbd Fluid Tray",
          "Drop GREEN hook on stbd LAB HR 0247 (near base of stbd LAB strut)" ],
            step: "Translate to PMA3 stbd/aft via ESP2 starboard route, EV2 leads" },
          {comment: "this is dumb",
            step: "Stow Cummerbund ORU Bag on PMA3 HR 1609 and 1605 (zenith stanchion) w/ hinge Nadir" },
          {step: "Open bag lid and restrain open using lid straps to HRs 1606 and 1605 (nadir stanchion)" } ] };
        var textObj4 = {"EV1 + EV2": [ { step: "Verify safety tethers not crossing" } ] };
        var textObj5 = {IV: [ {image: "pma3-large-oru-bag-location.jpg" } ] };
        var textObj6 = {"EV1 + EV2": [ { image: "pma3-translation.jpg"} ] };
            
        //insert document into object as if it was the yml file retrieved
        const initialyml = [ { title: 'PMA 3 cummerbunds install', 
          duration: 45, steps: [ textObj1, textObj2, textObj3, textObj4, textObj5, textObj6 ] } ];
    
        //test
        expect(initialyml).to.not.deep.equal(testyml);
      });
    });
});

function fakeMainText() {
    return `
    procedure_name: Foo Procedure 1

    actors:
        - role: IV/SSRMS
        - role: EV1
          name: Drew
        - role: EV2
          name: Taz

    tasks:
        - file: egress.yml
        - file: misse7.yml

    `;
}
function fakeTasksText() {
  return `
  title: EGRESS/SETUP
  duration: 25
  
  steps:
  
    # First steps in IV column (first column)
    - IV:
      - step: Record PET start time ____:____ (Pwr to Batt)
      - step: Start WVS Recorders
  
    - simo:
      EV1:
      - step: "{{CHECK}} All gates closed & hooks locked"
        checkboxes:
          - R Waist Tether to EV2 Blank hook
          - Red hook on L D-ring ext
          - Yellow hook on Green ERCM
          - Green hook on Red ERCM
          - Blank hook on MWS
      EV2:
      - step: "{{CHECKMARK}} All gates closed & hooks locked"
        checkboxes:
          - All gates closed & hooks locked
          - R Waist Tether to A/L D-ring ext
          - Red hook on L D-ring ext
          - Yellow hook on Green ERCM
          - Green hook on Red ERCM
          - Blank hook to EV1 R Waist Tether 
  `;
}
*/
