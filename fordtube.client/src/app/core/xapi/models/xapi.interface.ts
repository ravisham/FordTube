import { VerbId } from '../enums/verb-id.enum';

/**
 *
 A data sctructure showing evidence for any sort of experience or event which is to be tracked in xAPI as a Learning Record.
 *
 * @export
 * @interface Statement
 */
export interface Statement {
  /**
   *
   UUID assigned by LRS if not set by the Learning Record Provider.
   *
   * @type {string}
   * @memberof Statement
   */
  id?: string;

  /**
   *
   Whom the Statement is about, as an Agent or Group Object.
   *
   * @type {Actor}
   * @memberof Statement
   */
  actor: Actor;

  /**
   *
  Action taken by the Actor.
   *
   * @type {Verb}
   * @memberof Statement
   */
  verb: Verb;

  /**
   *
   Activity, Agent, or another Statement that is the Object of the Statement.
   *
   * @type {ContentObject}
   * @memberof Statement
   */
  object: ContentObject;

  /**
   *
   Result Object, further details representing a measured outcome.
   *
   * @type {Result}
   * @memberof Statement
   */
  result?: Result;

  /**
   *
    Context that gives the Statement more meaning. Examples: a team the Actor is working with, altitude at which a scenario was attempted in a flight simulator.
   *
   * @type {Context}
   * @memberof Statement
   */
  context?: Context;

  /**
   *
   Timestamp of when the events described within this Statement occurred. Set by the LRS if not provided.
   *
   * @type {string}
   * @memberof Statement
   */
  timestamp?: string;

  /**
   *
    The Statement’s associated xAPI version, formatted according to Semantic Versioning 1.0.0.
   *
   * @type {string}
   * @memberof Statement
   */
  version?: string;
}

/**
 *
 An individual or group representation tracked using Statements performing an action within an Activity. Is the "I" in "I did this".
 *
 * @export
 * @interface Actor
 */
export interface Actor {
  objectType: string;

  /**
   *
   Full name of the Agent.
   *
   * @type {string}
   * @memberof Actor
   */
  name: string;

  /**
   *
   A user account on an existing system e.g. an LMS or intranet.
   *
   * @type {Account}
   * @memberof Actor
   */
  account: Account;
}

/**
 *
 A user account on an existing system, such as a private system (LMS or intranet) or a public system (social networking site).
 *
 * @export
 * @interface Account
 */
export interface Account {
  /**
   *
   The canonical home page for the system the account is on. This is based on FOAF's accountServiceHomePage.
   *
   * @type {string}
   * @memberof Account
   */
  homePage: string;

  /**
   *
   The unique id or name used to log in to this account. This is based on FOAF's accountName.
   *
   * @type {string}
   * @memberof Account
   */
  name: string;
}

/**
 *
 The “context” field provides a place to add some contextual information to a statement.
 *
 * @export
 * @interface Context
 */
export interface Context {
  /**
   *
   A map of the types of learning activity context that this Statement is related to. Valid context types are: parent, "grouping", "category" and "other".
   *
   * @type {ContextActivities}
   * @memberof Context
   */
  contextActivities: ContextActivities;

  /**
   *
   A map of any other domain-specific context relevant to this Statement. For example, in a flight simulator altitude, airspeed, wind, attitude, GPS coordinates might all be relevant
   *
   * @type {Extensions}
   * @memberof Context
   */
  extensions?: Extensions;
}

/**
 *
 A map of the types of learning activity context that this Statement is related to.
 *
 * @export
 * @interface ContextActivities
 */
export interface ContextActivities {
  /**
   *
   An Activity with an indirect relation to the Activity which is the Object of the Statement.
   *
   * @type {Grouping[]}
   * @memberof ContextActivities
   */
  grouping?: Grouping[];

  /**
   *
   a contextActivity that doesn't fit one of the other properties.
   *
   * @type {Other[]}
   * @memberof ContextActivities
   */
  other?: Other[];
}

/**
 *
 An Activity with an indirect relation to the Activity which is the Object of the Statement.
 *
 * @export
 * @interface Grouping
 */
export interface Grouping {
  /**
   *
   *
   * @type {IRI}
   * @memberof Grouping
   */
  id: string;
  definition: GroupingDefinition;
  objectType: string;
}

export interface GroupingDefinition {
  name: Display;
  type: string;
}

export interface Display {
  'en-US': string;
}

/**
 *
 A contextActivity that doesn't fit one of the other properties. For example: Anna studies a textbook for a biology exam. The Statement's Activity refers to the textbook, and the exam is a contextActivity of type other.
 *
 * @export
 * @interface Other
 */
export interface Other {
  /**
   *
   An identifier for a single unique Activity
   *
   * @type {IRI}
   * @memberof Other
   */
  id: string;

  /**
   *
   Metadata
   *
   * @type {ObjectDefinition}
   * @memberof Other
   */
  definition?: OtherDefinition;

  /**
   *
   MUST be Activity when present
   *
   * @type {string}
   * @memberof Other
   */
  objectType: string;
}

export interface OtherDefinition {
  name: Display;
}

/**
 *
 Extensions are available as part of Activity Definitions, as part of a Statement's "context" property, or as part of a Statement's "result" property. In each case, extensions are intended to provide a natural way to extend those properties for some specialized use.
 *
 * @export
 * @interface Extensions
 */
export interface Extensions {
  'https://xapi.ford.com/extension/courseid': string;
  'https://xapi.ford.com/extension/starsid': string;
}

/**
 *
 The Object defines the thing that was acted on. The Object of a Statement can be an Activity, Agent/Group, SubStatement, or Statement Reference.
 *
 * @example The Object is an Activity: "Jeff wrote an essay about hiking."
 * @example The Object is an Agent: "Nellie interviewed Jeff."
 * @export
 * @interface ContentObject
 */
export interface ContentObject {
  /**
   *
   An identifier for a single unique Activity
   *
   * @example https://accounts.google.com/Logout
   * @type {IRI}
   * @memberof ContentObject
   */
  id: string;

  /**
   *
   Metadata
   *
   * @type {ObjectDefinition}
   * @memberof ContentObject
   */
  definition?: ObjectDefinition;

  /**
   *
   MUST be Activity when present
   *
   * @example Agent
   * @example Group
   * @example SubStatement
   * @example StatementRef
   * @type {string}
   * @memberof ContentObject
   */
  objectType?: string;

  /**
   *
   This is only relevant if this is a REVIEW activity
   *
   * @type {number}
   * @memberof ContentObject
   */
  rating?: number;
}

export interface ObjectDefinition {
  /**
   *
   The human readable/visual name of the Activity
   *
   * @type {Display}
   * @memberof ObjectDefinition
   */
  name: Display;

  /**
   *
   A description of the Activity
   *
   * @type {Display}
   * @memberof ObjectDefinition
   */
  description: Display;

  /**
   *
   *
   * @type {IRI}
   * @memberof ObjectDefinition
   */
  type: string;

  /**
   *
   *
   * @type {IRL}
   * @memberof ObjectDefinition
   */
  moreInfo: string;
}

/**
 *
 A statement can also end in some measured outcome. For example, if ‘Solo Hang Gliding’ is a course or an assessment, we could state that “Sally completed ‘Solo Hang Gliding’ with a passing score of 95%”,
 *
 * @export
 * @interface Result
 */
export interface Result {
  /**
   *
   Period of time over which the Statement occurred.
   *
   * @example P0Y0M0W0DT0H0M20S
   * @type {string}
   * @memberof Result
   */
  duration: string;

  /**
   *
   Indicates whether or not the Activity was completed.
   *
   * @type {boolean}
   * @memberof Result
   */
  completed?: boolean;

  /**
   *
   Indicates whether or not the attempt on the Activity was successful.
   *
   * @type {boolean}
   * @memberof Result
   */
  success?: boolean;

  /**
   *
   The score of the Agent in relation to the success or quality of the experience. See: Score
   *
   * @type {{scaled: number;}}
   * @memberof Result
   */
  score?: {
    /**
     *
     The score related to the experience as modified by scaling and/or normalization.
     *
     * @type {number}
     */
    scaled: number;
  };
}

/**
 The Verb defines the action between an Actor and an Activity.
 *
 * @export
 * @interface Verb
 */
export interface Verb {
  /**
   *
   Corresponds to a Verb definition. Each Verb definition corresponds to the meaning of a Verb, not the word.
   *
   * @type {VerbId}
   * @memberof Verb
   */
  id: VerbId;

  /**
   *
   The human readable representation of the Verb in one or more languages. This does not have any impact on the meaning of the Statement, but serves to give a human-readable display of the meaning already determined by the chosen Verb.
   *
   * @type {Display}
   * @memberof Verb
   */
  display: Display;
}
