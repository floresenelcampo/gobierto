require_dependency "gobierto_people"

module GobiertoPeople
  class PersonEvent < ApplicationRecord
    include User::Subscribable
    include GobiertoCommon::Searchable

    algoliasearch_gobierto do
      attribute :site_id, :title, :description, :updated_at
      searchableAttributes ['title', 'description']
      attributesForFaceting [:site_id]
      add_attribute :resource_path, :class_name
    end

    belongs_to :person, counter_cache: :events_count

    has_many :locations, class_name: "PersonEventLocation", dependent: :destroy
    has_many :attendees, class_name: "PersonEventAttendee", dependent: :destroy

    scope :past,     -> { published.where("starts_at <= ?", Time.zone.now) }
    scope :upcoming, -> { published.where("starts_at > ?", Time.zone.now) }
    scope :sorted,   -> { order(starts_at: :asc) }
    scope :by_date,  ->(date) { where("starts_at::date = ?", date) }

    scope :by_site, ->(site) do
      joins(:person).where(Person.table_name => { site_id: site.id })
    end

    scope :by_person_category, ->(category) do
      joins(:person).where(Person.table_name => { category: category })
    end

    scope :by_person_party, ->(party) do
      joins(:person).where(Person.table_name => { party: party })
    end

    delegate :site_id, to: :person
    delegate :admin_id, to: :person

    enum state: { pending: 0, published: 1 }

    def parameterize
      { person_id: person, id: self }
    end

    def past?
      starts_at <= Time.zone.now
    end

    def upcoming?
      starts_at > Time.zone.now
    end

    def active?
      published?
    end

    def self.csv_columns
      [:id, :person_id, :person_name, :title, :description, :starts_at, :ends_at, :attachment_url, :created_at, :updated_at]
    end

    def as_csv
      person_name = person.try(:name)

      [id, person_id, person_name, title, description.html_safe, starts_at, ends_at, attachment_url, created_at, updated_at]
    end
  end
end
